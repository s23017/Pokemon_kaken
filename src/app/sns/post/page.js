"use client";

import React, {useEffect, useRef, useState, Suspense} from "react";
import {initializeApp} from "firebase/app";
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    doc,
    getDoc,
} from "firebase/firestore";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
} from "firebase/storage";
import {getAuth, onAuthStateChanged, signOut} from "firebase/auth";
import {useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH,
    projectId: process.env.NEXT_PUBLIC_PRO,
    storageBucket: process.env.NEXT_PUBLIC_BUKET,
    messagingSenderId: process.env.NEXT_PUBLIC_POKEMON_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export default function PostPage() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <PostContent/>
        </Suspense>
    );
}

function PostContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [partyDetails, setPartyDetails] = useState([]);
    const cardContainerRef = useRef(null);


    // ログイン状態の確認
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/sns"); // ログインしていない場合はログインページへリダイレクト
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Firestoreから投稿一覧を取得
    useEffect(() => {
        const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPosts(postsData);
        });

        return () => unsubscribe();
    }, []);

    // クエリパラメータからパーティーデータを取得
    useEffect(() => {
        const partyData = searchParams.get("party");
        if (partyData) {
            const decodedParty = JSON.parse(decodeURIComponent(partyData));
            setPartyDetails(decodedParty);
        }
    }, [searchParams]);


    // 投稿の送信処理
    const handlePostSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || (!content.trim() && !image)) {
            alert("タイトルと投稿内容または画像を入力してください！");
            return;
        }

        const user = auth.currentUser;
        if (!user) return;

        let imageUrl = null;
        if (image) {
            try {
                const imageRef = ref(storage, `images/${user.uid}/${image.name}`);
                await uploadBytes(imageRef, image);
                imageUrl = await getDownloadURL(imageRef);
                console.log("画像アップロード成功:", imageUrl);
            } catch (error) {
                console.error("画像アップロードエラー:", error);
                alert("画像のアップロードに失敗しました。");
                return;
            }
        }

        const userDoc = await getDoc(doc(db, "users", user.uid));
        const username = userDoc.exists() ? userDoc.data().username: user.displayName || "匿名";

        try {
            await addDoc(collection(db, "posts"), {
                title,
                content,
                imageUrl,
                partyDetails,
                timestamp: Date.now(),
                userId: user.uid,
                username,
            });
            console.log("投稿が成功しました:", {title, content, imageUrl});
        } catch (error) {
            console.error("投稿エラー:", error);
            alert("投稿に失敗しました。");
        }

        setTitle("");
        setContent("");
        setImage(null);
    };

    // ログアウト処理
    // const handleLogout = async () => {
    //     try {
    //         await signOut(auth);
    //         router.push("/sns"); // ログアウト後ログインページへリダイレクト
    //     } catch (error) {
    //         console.error("ログアウト失敗:", error);
    //     }
    // };
    useEffect(() => {
        const partyData = searchParams.get("party");
        if (partyData) {
            const decodedParty = JSON.parse(decodeURIComponent(partyData));
            console.log("デコードされたパーティーデータ:", decodedParty);
            setPartyDetails(decodedParty);
        }
    }, [searchParams]);

    const typeMapping = {
        "ノーマル": "normal",
        "ほのお": "fire",
        "みず": "water",
        "でんき": "electric",
        "くさ": "grass",
        "こおり": "ice",
        "かくとう": "fighting",
        "どく": "poison",
        "じめん": "ground",
        "ひこう": "flying",
        "エスパー": "psychic",
        "むし": "bug",
        "いわ": "rock",
        "ゴースト": "ghost",
        "ドラゴン": "dragon",
        "あく": "dark",
        "はがね": "steel",
        "フェアリー": "fairy",
        "ステラ": "sutera",
    };
    const typeColors = {
        normal: "rgba(168, 168, 120, 0.8)",
        fire: "rgba(240, 128, 48, 0.8)",
        water: "rgba(104, 144, 240, 0.8)",
        electric: "rgba(248, 208, 48, 0.8)",
        grass: "rgba(120, 200, 80, 0.8)",
        ice: "rgba(152, 216, 216, 0.8)",
        fighting: "rgba(192, 48, 40, 0.8)",
        poison: "rgba(160, 64, 160, 0.8)",
        ground: "rgba(224, 192, 104, 0.8)",
        flying: "rgba(168, 144, 240, 0.8)",
        psychic: "rgba(248, 88, 136, 0.8)",
        bug: "rgba(168, 184, 32, 0.8)",
        rock: "rgba(184, 160, 56, 0.8)",
        ghost: "rgba(112, 88, 152, 0.8)",
        dragon: "rgba(112, 56, 248, 0.8)",
        dark: "rgba(112, 88, 72, 0.8)",
        steel: "rgba(184, 184, 208, 0.8)",
        fairy: "rgba(238, 153, 172, 0.8)"
    };

    const getTypeColor = (type) => {
        if (!type || type.length === 0) return "rgba(255, 255, 255, 0.8)"; // デフォルトの透明な白色

        const colors = type.map((t) => typeColors[t] || "rgba(255, 255, 255, 0.8)"); // タイプの色を取得

        // 単一タイプの場合
        if (colors.length === 1) {
            return colors[0];
        }

        // 複合タイプの場合（ぼかしを追加）
        if (colors.length === 2) {
            return `linear-gradient(90deg, ${colors[0]} 30%, ${colors[1]} 70%)`;
        }

        // 想定外の場合
        return "rgba(255, 255, 255, 0.8)";
    };


    return (
        <div
            style={{
                backgroundImage: 'url("/images/background.webp")',
                backgroundSize: "auto", // 画像サイズをそのままに
                backgroundRepeat: "repeat", // 繰り返して表示
                backgroundPosition: "top left", // 背景の位置を調整
                minHeight: "100vh",
                padding: "0",
                position: "relative", // 背景画像を親要素に合わせて配置
            }}
        >

            {/* 背景画像を全体に適用 */}
            <div
                style={{
                    backgroundImage: 'url("/images/background.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: -1, // 背景として表示するため
                }}
            ></div>
            <div>
                {/* ヘッダー */}
                <header
                    style={{
                        backgroundColor: "#FF0000",
                        color: "white",
                        textAlign: "center",
                        padding: "20px 0",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        zIndex: 1000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            left: "20px",
                            top: "50%",
                            transform: "translateY(-50%)",
                        }}
                    >

                        <Link href="/top">
                            <Image
                                src="/images/gaming.gif"
                                width={50}
                                height={50}
                                alt="ホームに戻る"
                                style={{cursor: "pointer"}}
                            />
                        </Link>
                    </div>
                    <h1 className="header-title">投稿</h1>
                </header>

                {/* メインコンテンツ */}
                <div style={{padding: "100px 20px 20px"}}>
                    {/* パーティーデータ表示 */}
                    <div ref={cardContainerRef} style={styles.gridContainer}>
                        {partyDetails.map((pokemon, index) => (
                            <div key={index} style={{
                                ...styles.container,
                                background: getTypeColor(pokemon.type),
                            }}>
                                <div style={styles.imageContainer}>
                                    <div style={styles.imageBox}>
                                        <img
                                            src={pokemon.imageUrl}
                                            alt="ポケモンの画像"
                                            style={styles.image}
                                        />
                                    </div>
                                    {pokemon.selectedTerastal ? (
                                        <div style={styles.terastalContainer}>
                                            <img
                                                src={`/images/terastals/${typeMapping[pokemon.selectedTerastal] || "unknown"}.png`}
                                                alt={`テラスタル ${pokemon.selectedTerastal}`}
                                                style={styles.terastalImage}
                                            />
                                        </div>
                                    ) : (
                                        <p>テラスタル未選択</p>
                                    )}
                                </div>
                                <div style={styles.infoContainer}>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>性格</span>
                                        <span style={styles.value}>{pokemon.selectedNature}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>持ち物</span>
                                        <span style={styles.value}>{pokemon.selectedItem}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>特性</span>
                                        <span style={styles.value}>{pokemon.selectedAbility}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>努力値</span>
                                        <span style={styles.value}>{Object.entries(pokemon.effortValues || {})
                                            .filter(([_, value]) => value !== 0) // 0をフィルタリング
                                            .map(([stat, value]) => `${stat}: ${value}`)
                                            .join(", ")}
                                    </span>
                                    </div>
                                    {pokemon.selectedMoves.map((move, moveIndex) => (
                                        <div style={styles.infoRow} key={moveIndex}>
                                            <span style={styles.label}>わざ {moveIndex + 1}</span>
                                            <span style={styles.value}>{move}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>


                    {/* 投稿フォーム */}
                    <form onSubmit={handlePostSubmit}>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="タイトルを入力"
                            style={{width: "100%", marginBottom: "10px", padding: "10px"}}
                            required
                        />
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="投稿内容を記入"
                            rows="3"
                            style={{width: "100%", marginBottom: "10px"}}
                        />
                        <input
                            type="file"
                            onChange={(e) => setImage(e.target.files[0])}
                            style={{display: "block", marginBottom: "10px"}}
                        />
                        <button type="submit">投稿する</button>
                    </form>

                    {/* 投稿一覧 */}
                    <div style={{ marginTop: "20px" }}>
                        <h2>投稿一覧</h2>
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                style={{
                                    border: "1px solid #000000",
                                    marginBottom: "10px",
                                    padding: "10px",
                                    backgroundColor: "rgba(255, 255, 255, 0.5)", // 透明度50%の白
                                }}
                            >
                                <p>
                                    <strong>投稿者:</strong> {post.username}
                                </p>
                                <p
                                    style={{
                                        color: "black",
                                        cursor: "pointer",
                                        fontSize: "35px",
                                    }}
                                    onClick={() => router.push(`/sns/details/${post.id}`)}
                                >
                                    <strong>{post.title}</strong>
                                </p>
                                {/* 投稿内容を1行に省略表示 */}
                                <p style={styles.postContent}>{post.content}</p>
                                {post.imageUrl && (
                                    <img
                                        src={post.imageUrl}
                                        alt="投稿画像"
                                        style={{ width: "10%", marginTop: "10px" }}
                                    />
                                )}
                                <div ref={cardContainerRef} style={styles.gridContainer}>
                                    {post.partyDetails && post.partyDetails.map((party, index) => (
                                        <div key={index} style={{
                                            ...styles.card,
                                            background: getTypeColor(party.type) // ここで背景色を適用
                                        }}>
                                            <div style={styles.imageContainer2}>
                                                <div style={styles.imageBox2}>
                                                    <img
                                                        src={party.imageUrl}
                                                        alt={`${party.name}の画像`}
                                                        style={styles.image}
                                                    />
                                                </div>
                                                {party.selectedTerastal ? (
                                                    <div style={styles.terastalContainer}>
                                                        <img
                                                            src={`/images/terastals/${typeMapping[party.selectedTerastal] || "unknown"}.png`}
                                                            alt={`テラスタル ${party.selectedTerastal}`}
                                                            style={styles.terastalImage}
                                                        />
                                                    </div>
                                                ) : (
                                                    <p>テラスタル未選択</p>
                                                )}
                                                <div style={styles.infoContainer}>
                                                    <div style={styles.infoRow}>
                                                        <span style={styles.label}>性格</span>
                                                        <span style={styles.value}>{party.selectedNature}</span>
                                                    </div>
                                                    <div style={styles.infoRow}>
                                                        <span style={styles.label}>持ち物</span>
                                                        <span style={styles.value}>{party.selectedItem}</span>
                                                    </div>
                                                    <div style={styles.infoRow}>
                                                        <span style={styles.label}>特性</span>
                                                        <span style={styles.value}>{party.selectedAbility}</span>
                                                    </div>
                                                    <div style={styles.infoRow}>
                                                        <span style={styles.label}>努力値</span>
                                                        <span style={styles.value}>
                            {Object.entries(party.effortValues || {})
                                .filter(([_, value]) => value !== 0)
                                .map(([stat, value]) => `${stat}: ${value}`)
                                .join(", ")}
                        </span>
                                                    </div>
                                                    {[...Array(4)].map((_, i) => (
                                                        <div style={styles.infoRow} key={i}>
                                                            <span style={styles.label}>わざ{i + 1}</span>
                                                            <span
                                                                style={styles.value}>{party.selectedMoves?.[i] || "未選択"}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>


                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
            );
            };
        const styles = {
            partyDetailsContainer: {
            marginBottom: "20px",
            textAlign: "center",
        },
            pokemonDetail: {
            marginBottom: "10px",
        },
            pokemonImage: {
            width: "120px",
            height: "120px",
            objectFit: "contain",
            border: "1px solid #ccc",
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
            terastalContainer: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            marginTop: "10px",
        },
            terastalImage: {
            width: "40px",
            height: "40px",
            objectFit: "contain",
            marginBottom: "5px",
        },
            saveButton: {
            margin: "20px auto",
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",

            borderRadius: "5px",
            cursor: "pointer",
            display: "block",
        },
            gridContainer: {
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0px", // 余白を完全になくす
            padding: "0", // コンテナの内側余白をなくす
            margin: "center", // 外側余白をなくす
            width: "fit-content", // コンテンツの幅に合わせる
            height: "fit-content", // コンテンツの高さに合わせる
        },
            container: {
            margin: "center", // カードの外側余白を削除
            padding: "10px", // 適切な内側余白を設定
            border: "1px solid #ccc",
            backgroundColor: "#f9f9f9",
            width: "300px", // コンテンツの幅に合わせる
            height: "fit-content", // コンテンツの高さに合わせる
        },
            imageContainer: {
            flex: "1",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
            imageContainer2: {
            border: "1px solid #ccc",
            flex: "1",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
            imageBox: {
            width: "100px", // 幅を固定
            height: "100px", // 高さを固定
            backgroundColor: "#ddd",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "10px",
            margin: "0", // マージンを削除
        },
            imageBox2: {
            width: "100px", // 幅を固定
            height: "100px", // 高さを固定
            backgroundColor: "#ddd",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0", // マージンを削除
        },
            image: {
            maxWidth: "100%",
            maxHeight: "100%",
            borderRadius: "10px",
        },
            infoContainer: {
            flex: "2",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2px",
        },
            infoRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#eee",
            padding: "2px", // パディングを小さくする
            margin: "0",   // マージンを削除
            borderRadius: "3px", // 少しだけ丸みを残す
            fontSize: "12px", // フォントサイズを調整
        },
            label: {
            fontWeight: "bold",
            color: "#333",
        },
            value: {
            color: "#555",
        },
            postContent: {
                whiteSpace: "nowrap",       // 1行にする
                overflow: "hidden",         // はみ出した部分を隠す
                textOverflow: "ellipsis",   // "..." で省略表示
                maxWidth: "100%",           // 最大幅を調整（親要素の幅に収める）
                fontSize: "14px",           // 文字サイズを調整
                color: "#555",              // 文字色を統一
            },
        };