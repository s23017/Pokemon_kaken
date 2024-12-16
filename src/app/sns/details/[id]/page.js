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
    deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useParams, useRouter } from "next/navigation";

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

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const user = auth.currentUser;
        if (!user) return;

        await addDoc(collection(db, `posts/${id}/comments`), {
            content: newComment,
            timestamp: Date.now(),
            userId: user.uid,
            username: user.displayName || "匿名",
        });

        setNewComment("");
    };

    const handlePostDelete = async () => {
        const user = auth.currentUser;
        if (!user || post.userId !== user.uid) {
            alert("削除権限がありません！");
            return;
        }

        const confirmed = window.confirm("この投稿を削除しますか？");
        if (confirmed) {
            await deleteDoc(doc(db, "posts", id));
            alert("投稿を削除しました！");
            router.push("/sns/post");
        }
    };

    const handlePostEdit = async () => {
        const user = auth.currentUser;
        if (!user || post.userId !== user.uid) {
            alert("編集権限がありません！");
            return;
        }

        await updateDoc(doc(db, "posts", id), { content: updatedPostContent });
        setEditingPost(false);
        alert("投稿を編集しました！");
    };

    const handleCommentDelete = async (commentId, commentUserId) => {
        const user = auth.currentUser;
        if (!user || commentUserId !== user.uid) {
            alert("削除権限がありません！");
            return;
        }

        const confirmed = window.confirm("このコメントを削除しますか？");
        if (confirmed) {
            await deleteDoc(doc(db, `posts/${id}/comments`, commentId));
            alert("コメントを削除しました！");
        }
    };

    const handleCommentEdit = async (commentId, commentUserId) => {
        const user = auth.currentUser;
        if (!user || commentUserId !== user.uid) {
            alert("編集権限がありません！");
            return;
        }

        await updateDoc(doc(db, `posts/${id}/comments`, commentId), {
            content: updatedCommentContent,
        });
        setEditingComment(null);
        alert("コメントを編集しました！");
    };

    return (
        <div style={{ padding: "20px" }}>
            {post && (
                <>
                    <h1>{post.title}</h1>
                    <p><strong>ユーザー名:</strong> {post.username}</p>
                    {editingPost ? (
                        <>
                            <textarea
                                value={updatedPostContent}
                                onChange={(e) => setUpdatedPostContent(e.target.value)}
                                rows="3"
                                style={{ width: "100%", marginBottom: "10px" }}
                            />
                            <button
                                style={{
                                    padding: "10px",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                    marginRight: "5px",
                                }}
                                onClick={handlePostEdit}
                            >
                                更新
                            </button>
                            <button
                                style={{
                                    padding: "10px",
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                                onClick={() => setEditingPost(false)}
                            >
                                キャンセル
                            </button>
                        </>
                    ) : (
                        <>
                            <p>{post.content}</p>
                            {auth.currentUser?.uid === post.userId && (
                                <div>
                                    <button
                                        style={{
                                            padding: "10px",
                                            backgroundColor: "#2196F3",
                                            color: "white",
                                            border: "none",
                                            cursor: "pointer",
                                            marginRight: "5px",
                                        }}
                                        onClick={() => setEditingPost(true)}
                                    >
                                        編集
                                    </button>
                                    <button
                                        style={{
                                            padding: "10px",
                                            backgroundColor: "#f44336",
                                            color: "white",
                                            border: "none",
                                            cursor: "pointer",
                                        }}
                                        onClick={handlePostDelete}
                                    >
                                        削除
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            <div style={{ marginTop: "20px" }}>
                <h2>コメント</h2>
                <form onSubmit={handleCommentSubmit}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="コメントを入力"
                        rows="3"
                        style={{ width: "100%", marginBottom: "10px" }}
                    />
                    <button
                        style={{
                            padding: "10px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                        }}
                        type="submit"
                    >
                        コメントを投稿
                    </button>
                </form>
                <div style={{ marginTop: "10px" }}>
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            style={{
                                border: "1px solid #ccc",
                                marginBottom: "10px",
                                padding: "10px",
                            }}
                        >
                            <p><strong>{comment.username || "匿名"}:</strong></p>
                            {editingComment === comment.id ? (
                                <>
                                    <textarea
                                        value={updatedCommentContent}
                                        onChange={(e) =>
                                            setUpdatedCommentContent(e.target.value)
                                        }
                                        rows="3"
                                        style={{ width: "100%", marginBottom: "10px" }}
                                    />
                                    <button
                                        style={{
                                            padding: "10px",
                                            backgroundColor: "#4CAF50",
                                            color: "white",
                                            border: "none",
                                            cursor: "pointer",
                                            marginRight: "5px",
                                        }}
                                        onClick={() =>
                                            handleCommentEdit(comment.id, comment.userId)
                                        }
                                    >
                                        更新
                                    </button>
                                    <button
                                        style={{
                                            padding: "10px",
                                            backgroundColor: "#f44336",
                                            color: "white",
                                            border: "none",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => setEditingComment(null)}
                                    >
                                        キャンセル
                                    </button>
                                </>
                            ) : (
                                <p>{comment.content}</p>
                            )}
                            {auth.currentUser?.uid === comment.userId && (
                                <div>
                                    <button
                                        style={{
                                            padding: "10px",
                                            backgroundColor: "#2196F3",
                                            color: "white",
                                            border: "none",
                                            cursor: "pointer",
                                            marginRight: "5px",
                                        }}
                                        onClick={() => {
                                            setEditingComment(comment.id);
                                            setUpdatedCommentContent(comment.content);
                                        }}
                                    >
                                        編集
                                    </button>
                                    <button
                                        style={{
                                            padding: "10px",
                                            backgroundColor: "#f44336",
                                            color: "white",
                                            border: "none",
                                            cursor: "pointer",
                                        }}
                                        onClick={() =>
                                            handleCommentDelete(comment.id, comment.userId)
                                        }
                                    >
                                        削除
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
