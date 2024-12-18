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
    const router = useRouter();
    const searchParams = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [partyImages, setPartyImages] = useState([]);

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

    // クエリパラメータからパーティー画像URLを取得
    useEffect(() => {
        const images = [];
        for (let i = 1; i <= 6; i++) {
            const imageUrl = searchParams.get(`image${i}`);
            if (imageUrl) images.push(imageUrl);
        }
        setPartyImages(images);
    }, [searchParams]);

    // 投稿の送信処理
    const handlePostSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || (!content.trim() && !image)) {
            alert("タイトルと投稿内容または画像を入力してください！");
            return;
        }

        let imageUrl = "";
        if (image) {
            const imageRef = ref(storage, `images/${image.name}`);
            await uploadBytes(imageRef, image);
            imageUrl = await getDownloadURL(imageRef);
        }

        const user = auth.currentUser;
        if (!user) return;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        const username = userDoc.exists() ? userDoc.data().username : "匿名";

        await addDoc(collection(db, "posts"), {
            title,
            content,
            imageUrl,
            partyImages,
            timestamp: Date.now(),
            userId: user.uid,
            username,
        });

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
                {/* パーティー画像表示 */}
                {partyImages.length > 0 && (
                    <div style={styles.partyImagesContainer}>
                        <h3>パーティーに含まれるポケモン</h3>
                        <div style={styles.imageGrid}>
                            {partyImages.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`ポケモン${index + 1}`}
                                    style={styles.pokemonImage}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* 投稿フォーム */}
                <form onSubmit={handlePostSubmit}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="タイトルを入力"
                        style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
                        required
                    />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="投稿内容を記入"
                        rows="3"
                        style={{ width: "100%", marginBottom: "10px" }}
                    />
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                        style={{ display: "block", marginBottom: "10px" }}
                    />
                    <button type="submit">投稿する</button>
                </form>

                {/* 投稿一覧 */}
                {/* 投稿一覧 */}
                <div style={{ marginTop: "20px" }}>
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
                            {/* ポケモン画像を表示 */}
                            {post.partyImages && post.partyImages.length > 0 && (
                                <div style={styles.imageGrid}>
                                    {post.partyImages.map((url, index) => (
                                        <img
                                            key={index}
                                            src={url}
                                            alt={`ポケモン${index + 1}`}
                                            style={styles.pokemonImage}
                                        />
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
    partyImagesContainer: {
        marginBottom: "20px",
        textAlign: "center",
    },
    imageGrid: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "10px",
    },
    pokemonImage: {
        width: "120px",
        height: "120px",
        objectFit: "contain",
        border: "1px solid #ccc",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
};
