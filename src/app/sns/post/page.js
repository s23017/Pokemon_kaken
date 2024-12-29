"use client";

import React, {useEffect, useRef, useState} from "react";
import { initializeApp } from "firebase/app";
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
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export default function PostPage() {
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
        const username = userDoc.exists() ? userDoc.data().username : "匿名";

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
            console.log("投稿が成功しました:", { title, content, imageUrl });
        } catch (error) {
            console.error("投稿エラー:", error);
            alert("投稿に失敗しました。");
        }

        setTitle("");
        setContent("");
        setImage(null);
    };

    // ログアウト処理
    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/sns"); // ログアウト後ログインページへリダイレクト
        } catch (error) {
            console.error("ログアウト失敗:", error);
        }
    };
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
    const getTypeColor = (types) => {
        const typeColors = {
            はがね: "#A8A8C0",
            フェアリー: "#F4BDC9",
            じめん: "#E0C068",
            でんき: "#FAE078",
            みず: "#6890F0",
            ほのお: "#F08030",
            // 他のタイプを追加
        };
        return types.map((type) => typeColors[type] || "#D3D3D3").join(", ");
    };


    return (
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
                    <Link href="/">
                        <Image
                            src="/images/gaming.gif"
                            width={50}
                            height={50}
                            alt="ホームに戻る"
                            style={{ cursor: "pointer" }}
                        />
                    </Link>
                </div>
                <h1 className="header-title">投稿</h1>
                <button
                    onClick={handleLogout}
                    style={{
                        position: "absolute",
                        right: "20px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        backgroundColor: "transparent",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "16px",
                    }}
                >
                    ログアウト
                </button>
            </header>

            {/* メインコンテンツ */}
            <div style={{ padding: "100px 20px 20px" }}>
                {/* パーティーデータ表示 */}
                <div ref={cardContainerRef} style={styles.gridContainer}>
                    {partyDetails.map((pokemon, index) => (
                        <div key={index} style={styles.container}>
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
                                <div style={{marginTop: "20px"}}>
                                    <h2>投稿一覧</h2>
                                    {posts.map((post) => (
                                        <div
                                            key={post.id}
                                            style={{
                                                border: "1px solid #ccc",
                                                marginBottom: "10px",
                                                padding: "10px",
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
                                            <p>{post.content}</p>
                                            <div ref={cardContainerRef} style={styles.gridContainer}>
                                                {post.partyDetails && post.partyDetails.map((party, index) => (
                                                    <div key={index} style={styles.card}>
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
                                                                <span
                                                                    style={styles.value}>{party.selectedAbility}</span>
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
                                                            <div style={styles.infoRow}>
                                                                <span style={styles.label}>わざ1</span>
                                                                <span
                                                                    style={styles.value}>{party.selectedMoves?.[0] || "未選択"}</span>
                                                            </div>
                                                            <div style={styles.infoRow}>
                                                                <span style={styles.label}>わざ2</span>
                                                                <span
                                                                    style={styles.value}>{party.selectedMoves?.[1] || "未選択"}</span>
                                                            </div>
                                                            <div style={styles.infoRow}>
                                                                <span style={styles.label}>わざ3</span>
                                                                <span
                                                                    style={styles.value}>{party.selectedMoves?.[2] || "未選択"}</span>
                                                            </div>
                                                            <div style={styles.infoRow}>
                                                                <span style={styles.label}>わざ4</span>
                                                                <span
                                                                    style={styles.value}>{party.selectedMoves?.[3] || "未選択"}</span>
                                                            </div>
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
        border: "1px solid #ccc",
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
};


