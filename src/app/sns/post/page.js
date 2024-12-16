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
    deleteDoc,
    updateDoc,
    getDoc,
} from "firebase/firestore";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
} from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

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
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [newContent, setNewContent] = useState("");

    // ユーザー認証の確認
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/login"); // ログインページにリダイレクト
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Firestoreの投稿をリアルタイムで取得
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

    // 投稿の送信処理
    const handlePostSubmit = async (e) => {
        e.preventDefault();

        // 画像もしくは文字がどちらも空の場合はアラートを表示
        if (!content.trim() && !image) {
            alert("投稿には画像またはテキストのいずれかが必要です！");
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

        // Firestoreからユーザー名を取得
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const username = userDoc.exists() ? userDoc.data().username : "匿名";

        await addDoc(collection(db, "posts"), {
            content,
            imageUrl,
            timestamp: Date.now(),
            userId: user.uid, // 投稿者のIDを保存
            username, // 投稿者のユーザー名を保存
        });

        setContent("");
        setImage(null);
    };

    // 投稿の削除処理
    const handleDelete = async (postId) => {
        const confirmed = window.confirm("この投稿を削除しますか？");
        if (confirmed) {
            try {
                await deleteDoc(doc(db, "posts", postId));
                alert("投稿を削除しました！");
            } catch (err) {
                console.error("削除エラー:", err);
            }
        }
    };

    // 投稿の編集処理
    const handleEdit = async (postId) => {
        try {
            await updateDoc(doc(db, "posts", postId), { content: newContent });
            alert("投稿を更新しました！");
            setEditingPost(null); // 編集モードを解除
        } catch (err) {
            console.error("更新エラー:", err);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>投稿ページ</h1>
            <form onSubmit={handlePostSubmit}>
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
                            <strong>ユーザー名: {post.username}</strong>
                        </p>
                        <p>{post.content}</p>
                        {post.imageUrl && (
                            <img
                                src={post.imageUrl}
                                alt="Post"
                                style={{ maxWidth: "100%" }}
                            />
                        )}

                        {auth.currentUser?.uid === post.userId && (
                            <div style={{ marginTop: "10px" }}>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    style={{
                                        marginRight: "10px",
                                        backgroundColor: "red",
                                        color: "white",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "5px 10px",
                                    }}
                                >
                                    削除
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingPost(post.id);
                                        setNewContent(post.content);
                                    }}
                                    style={{
                                        backgroundColor: "blue",
                                        color: "white",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "5px 10px",
                                    }}
                                >
                                    編集
                                </button>
                            </div>
                        )}

                        {editingPost === post.id && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleEdit(post.id);
                                }}
                                style={{ marginTop: "10px" }}
                            >
                                <textarea
                                    value={newContent}
                                    onChange={(e) =>
                                        setNewContent(e.target.value)
                                    }
                                    rows="3"
                                    style={{
                                        width: "100%",
                                        marginBottom: "10px",
                                    }}
                                />
                                <button
                                    type="submit"
                                    style={{
                                        backgroundColor: "green",
                                        color: "white",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "5px 10px",
                                    }}
                                >
                                    更新
                                </button>
                            </form>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
