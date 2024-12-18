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
    const [title, setTitle] = useState(""); // タイトルを追加
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/login");
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
            timestamp: Date.now(),
            userId: user.uid,
            username,
        });

        setTitle("");
        setContent("");
        setImage(null);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>投稿ページ</h1>
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
                        <p><strong>ユーザー名:</strong> {post.username}</p>
                        <p
                            style={{ color: "blue", cursor: "pointer" }}
                            onClick={() => router.push(`/sns/details/${post.id}`)}
                        >
                            <strong>{post.title}</strong>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
