"use client";

import React, { useEffect, useState } from "react";
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
                {partyDetails.length > 0 && (
                    <div style={styles.partyDetailsContainer}>
                        <h3>パーティーに含まれるポケモン</h3>
                        {partyDetails.map((pokemon, index) => (
                            <div key={index} style={styles.pokemonDetail}>
                                <h4>{pokemon.name}</h4>
                                <img
                                    src={pokemon.imageUrl}
                                    alt={pokemon.name}
                                    style={styles.pokemonImage}
                                />
                                <p><strong>特性:</strong> {pokemon.selectedAbility || "未選択"}</p>
                                <p><strong>性格:</strong> {pokemon.selectedNature || "未選択"}</p>
                                <p><strong>持ち物:</strong> {pokemon.selectedItem || "未選択"}</p>
                                <p><strong>テラスタル:</strong></p>
                                {typeof pokemon.selectedTerastal === "string" ? (
                                    <div style={styles.terastalContainer}>
                                        <img
                                            src={`/images/terastals/${typeMapping[pokemon.selectedTerastal] || "unknown"}.png`}
                                            alt={`テラスタル ${pokemon.selectedTerastal}`}
                                            style={styles.terastalImage}
                                        />
                                    </div>
                                ) : pokemon.selectedTerastal ? (
                                    <div style={styles.terastalContainer}>
                                        <img
                                            src={pokemon.selectedTerastal.image}
                                            alt={`テラスタル ${pokemon.selectedTerastal.type}`}
                                            style={styles.terastalImage}
                                        />
                                        <p>{pokemon.selectedTerastal.type}</p>
                                    </div>
                                ) : (
                                    <p>テラスタル未選択</p>
                                )}
                                <p><strong>技:</strong> {pokemon.selectedMoves.join(", ") || "未選択"}</p>
                                <p><strong>努力値:</strong></p>
                                <ul>
                                    {Object.entries(pokemon.effortValues).map(([stat, value]) => (
                                        <p key={stat}>{stat}: {value}</p>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>


                )}

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
                            <h3>{post.title}</h3>
                            <p>{post.content}</p>
                            {post.imageUrl && (
                                <img
                                    src={post.imageUrl}
                                    alt="投稿画像"
                                    style={styles.pokemonImage}
                                />
                            )}
                            {post.partyDetails && (
                                <div style={styles.partyDetailsContainer}>
                                    <h3>パーティーに含まれるポケモン</h3>
                                    {partyDetails.map((pokemon, index) => (
                                        <div key={index} style={styles.pokemonDetail}>
                                            <h4>{pokemon.name}</h4>
                                            <img
                                                src={pokemon.imageUrl}
                                                alt={pokemon.name}
                                                style={styles.pokemonImage}
                                            />
                                            <p><strong>特性:</strong> {pokemon.selectedAbility || "未選択"}</p>
                                            <p><strong>性格:</strong> {pokemon.selectedNature || "未選択"}</p>
                                            <p><strong>持ち物:</strong> {pokemon.selectedItem || "未選択"}</p>
                                            <p><strong>テラスタル:</strong></p>
                                            {pokemon.selectedTerastal ? (
                                                <div style={styles.terastalContainer}>
                                                    <img
                                                        src={pokemon.selectedTerastal.image}
                                                        alt={`テラスタル ${pokemon.selectedTerastal.type}`}
                                                        style={styles.terastalImage}
                                                    />
                                                    <p>{pokemon.selectedTerastal.type}</p>
                                                </div>
                                            ) : (
                                                <p>テラスタル未選択</p>
                                            )}

                                            <p><strong>技:</strong> {pokemon.selectedMoves.join(", ") || "未選択"}</p>
                                            <p><strong>努力値:</strong></p>
                                            <ul>
                                                {Object.entries(pokemon.effortValues).map(([stat, value]) => (
                                                    <li key={stat}>{stat}: {value}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

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
        width: "80px",
        height: "80px",
        objectFit: "contain",
        marginBottom: "5px",
    },
};
