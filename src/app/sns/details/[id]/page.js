"use client";

import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
    getFirestore,
    doc,
    getDoc,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useParams, useRouter } from "next/navigation";
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
const auth = getAuth(app);
const storage = getStorage(app);

export default function PostDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [editingPost, setEditingPost] = useState(false);
    const [updatedPostContent, setUpdatedPostContent] = useState("");
    const [editingComment, setEditingComment] = useState(null);
    const [updatedCommentContent, setUpdatedCommentContent] = useState("");
    const [image, setImage] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState("");

    useEffect(() => {
        const fetchPost = async () => {
            const docRef = doc(db, "posts", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setPost(docSnap.data());
                setUpdatedPostContent(docSnap.data().content);
            }
        };

        fetchPost();

        const q = query(
            collection(db, `posts/${id}/comments`),
            orderBy("timestamp", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setComments(commentsData);
        });

        return () => unsubscribe();
    }, [id]);

    const handleImageUpload = async (file) => {
        if (!file) return;
        const storageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setUploadedImageUrl(url);
        return url;
    };

    const handlePostSubmit = async () => {
        const user = auth.currentUser;
        if (!user || !uploadedImageUrl) return;

        await updateDoc(doc(db, "posts", id), {
            content: updatedPostContent,
            imageUrl: uploadedImageUrl,
        });

        setEditingPost(false);
        alert("投稿を更新しました！");
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const user = auth.currentUser;
        if (!user) return;

        await addDoc(collection(db, `posts/${id}/comments`), {
            content: newComment,
            imageUrl: uploadedImageUrl, // コメントにも画像を保存
            timestamp: Date.now(),
            userId: user.uid,
            username: user.displayName || "匿名",
        });

        setNewComment("");
        setUploadedImageUrl("");
    };

    return (
        <div>
            {/* Main Content */}
            <div style={{ padding: "100px 20px 20px" }}>
                {post && (
                    <>
                        <h1>{post.title}</h1>
                        <p>
                            <strong>ユーザー名:</strong> {post.username}
                        </p>
                        {editingPost ? (
                            <>
                                <textarea
                                    value={updatedPostContent}
                                    onChange={(e) =>
                                        setUpdatedPostContent(e.target.value)
                                    }
                                    rows="3"
                                    style={{
                                        width: "100%",
                                        marginBottom: "10px",
                                    }}
                                />
                                <input
                                    type="file"
                                    onChange={(e) =>
                                        handleImageUpload(e.target.files[0])
                                    }
                                />
                                <button
                                    onClick={handlePostSubmit}
                                    style={{
                                        padding: "10px",
                                        backgroundColor: "#4CAF50",
                                        color: "white",
                                        cursor: "pointer",
                                    }}
                                >
                                    更新
                                </button>
                            </>
                        ) : (
                            <>
                                <p>{post.content}</p>
                                {post.imageUrl && (
                                    <img
                                        src={post.imageUrl}
                                        alt="投稿画像"
                                        style={{ maxWidth: "100%" }}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}

                {/* Comments */}
                <form onSubmit={handleCommentSubmit}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="コメントを入力"
                        rows="3"
                        style={{ width: "100%" }}
                    />
                    <input
                        type="file"
                        onChange={(e) => handleImageUpload(e.target.files[0])}
                    />
                    <button type="submit">コメントを投稿</button>
                </form>
                {comments.map((comment) => (
                    <div key={comment.id}>
                        <p>
                            <strong>{comment.username}:</strong> {comment.content}
                        </p>
                        {comment.imageUrl && (
                            <img
                                src={comment.imageUrl}
                                alt="コメント画像"
                                style={{ maxWidth: "100%" }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
