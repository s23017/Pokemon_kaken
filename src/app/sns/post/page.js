"use client";

import React, { useEffect, useState } from "react";
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
    getAuth,
    onAuthStateChanged,
    signOut,
} from "firebase/auth";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
} from "firebase/storage";
import { useRouter } from "next/navigation";
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

// Initialize Firebase
import { initializeApp } from "firebase/app";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export default function PostPage() {
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState(""); // タイトルを追加
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null); // 投稿画像
    const [userImage, setUserImage] = useState(null); // アイコン画像

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/sns"); // ログインしていない場合はログインページにリダイレクト
            }
        });

        return () => unsubscribe();
    }, [router]);

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

    const uploadToStorage = async (file) => {
        const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || (!content.trim() && !image)) {
            alert("タイトルと投稿内容または画像を入力してください！");
            return;
        }

        const user = auth.currentUser;
        if (!user) return;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        const username = userDoc.exists() ? userDoc.data().username : "匿名";

        let postImageUrl = null;
        if (image) {
            postImageUrl = await uploadToStorage(image);
        }

        let userImageUrl = null;
        if (userImage) {
            userImageUrl = await uploadToStorage(userImage);
        }

        await addDoc(collection(db, "posts"), {
            title,
            content,
            userImage: userImageUrl, // アイコン画像
            postImage: postImageUrl, // 投稿画像
            timestamp: Date.now(),
            userId: user.uid,
            username,
        });

        setTitle("");
        setContent("");
        setImage(null);
        setUserImage(null);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/sns"); // ログアウト後にログインページへリダイレクト
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
                    position: "fixed", // ヘッダーを固定
                    top: 0,
                    left: 0,
                    width: "100%",
                    zIndex: 1000, // 高い優先度を持つ
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
                <form onSubmit={handlePostSubmit}>
                    <label>アイコン画像を設定:</label>
                    <input
                        type="file"
                        onChange={(e) => setUserImage(e.target.files[0])}
                        style={{ display: "block", marginBottom: "10px" }}
                    />
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
                            {post.userImage && (
                                <img
                                    src={post.userImage}
                                    alt="ユーザーアイコン"
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                            )}
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
                            {post.postImage && (
                                <img
                                    src={post.postImage}
                                    alt="投稿画像"
                                    style={{ width: "100%", marginTop: "10px" }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .header-title {
                    font-size: 24px;
                }
            `}</style>
        </div>
    );
}
