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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function PostDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [post, setPost] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState([]);
    const [editingComment, setEditingComment] = useState(null);
    const [updatedCommentContent, setUpdatedCommentContent] = useState("");
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchPost = async () => {
            const docRef = doc(db, "posts", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setPost(docSnap.data());
            }
        };

        fetchPost();

        const q = query(collection(db, `posts/${id}/comments`), orderBy("timestamp", "desc"));
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
        if (!user) return alert("ログインが必要です！");

        await addDoc(collection(db, `posts/${id}/comments`), {
            content: newComment,
            timestamp: Date.now(),
            userId: user.uid,
            username: user.displayName || "匿名",
        });

        setNewComment("");
    };

    // コメント削除
    const handleCommentDelete = async (commentId, commentUserId) => {
        if (!user || user.uid !== commentUserId) {
            alert("削除権限がありません！");
            return;
        }

        const confirmed = window.confirm("このコメントを削除しますか？");
        if (confirmed) {
            await deleteDoc(doc(db, `posts/${id}/comments`, commentId));
            alert("コメントを削除しました！");
        }
    };

    // コメント編集
    const handleCommentEdit = async (commentId, commentUserId) => {
        if (!user || user.uid !== commentUserId) {
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
                <header style={styles.header}>
                    <div style={styles.backButton}>
                        <Link href="/sns/post">
                            <Image src="/images/gaming.gif" width={50} height={50} alt="戻る"
                                   style={{cursor: "pointer"}}/>
                        </Link>
                    </div>
                    <h1 className="header-title">投稿詳細</h1>
                </header>

                {/* 投稿の詳細情報 */}
                <div style={{padding: "100px 20px 20px"}}>
                    {post && (

                        <>
                        <div style={styles.commentBox2}>

                            <h1>{post.title}</h1>
                            <p><strong>投稿者:</strong> {post.username}</p>
                            <p>{post.content}</p>
                        </div>

                            {post.imageUrl && (
                                <img src={post.imageUrl} alt="投稿画像" style={styles.postImage}/>
                            )}

                            {/* パーティーデータ表示 */}
                            {post.partyDetails && post.partyDetails.length > 0 && (
                                <div style={styles.gridContainer}>
                                    {post.partyDetails.map((pokemon, index) => (
                                        <div key={index} style={{
                                            ...styles.container,
                                            background: getTypeColor(pokemon.type) // タイプに応じた背景色を設定
                                        }}>
                                            <div style={styles.imageContainer}>
                                                <div style={styles.imageBox}>
                                                    <img src={pokemon.imageUrl} alt="ポケモンの画像"
                                                         style={styles.image}/>
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
                                                    <span style={styles.value}>
                            {Object.entries(pokemon.effortValues || {})
                                .filter(([_, value]) => value !== 0)
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
                            )}

                            {/* コメント入力フォーム */}
                            {user && (
                                <form onSubmit={handleCommentSubmit} style={{marginTop: "20px"}}>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="コメントを入力"
                                    rows="3"
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "5px",
                                        border: "1px solid #ccc"
                                    }}
                                />
                                    <button type="submit" style={styles.buttonPrimary}>
                                        コメントを投稿
                                    </button>
                                </form>
                            )}

                            {/* コメント表示 */}
                            <div style={{marginTop: "20px"}}>
                                <h2>コメント</h2>
                                {comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <div key={comment.id} style={styles.commentBox}>
                                            <p><strong>{comment.username}:</strong></p>

                                            {editingComment === comment.id ? (
                                                <>
                                                <textarea
                                                    value={updatedCommentContent}
                                                    onChange={(e) => setUpdatedCommentContent(e.target.value)}
                                                    placeholder="コメントを編集"
                                                    rows="3"
                                                    style={styles.textArea}
                                                />
                                                    <button
                                                        onClick={() => handleCommentEdit(comment.id, comment.userId)}
                                                        style={styles.buttonPrimary}>更新
                                                    </button>
                                                    <button onClick={() => setEditingComment(null)}
                                                            style={styles.buttonSecondary}>キャンセル
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <p>{comment.content}</p>
                                                    {user?.uid === comment.userId && (
                                                        <div>
                                                            <button onClick={() => {
                                                                setEditingComment(comment.id);
                                                                setUpdatedCommentContent(comment.content);
                                                            }} style={styles.buttonEdit}>編集
                                                            </button>
                                                            <button
                                                                onClick={() => handleCommentDelete(comment.id, comment.userId)}
                                                                style={styles.buttonDelete}>削除
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p>コメントはまだありません。</p>
                                )}
                            </div>

                        </>
                        )}
                        </div>
                        </div>
                        </div>
                        );

            }

            const styles = {
            header: {
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
        },
            backButton: {
            position: "absolute",
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
        },
            postImage: {
            width: "100%",
            maxHeight: "400px",
            objectFit: "contain",
            marginTop: "10px",
            borderRadius: "10px",
        },
            gridContainer: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "11px",
            marginTop: "20px",
        },
            container: {
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "10px",
            backgroundColor: "#f9f9f9",
            textAlign: "center",
                width: "300px",
        },
            imageContainer: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        },
            imageBox: {
            width: "100px",
            height: "100px",
            backgroundColor: "#ddd",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "10px",
        },
            image: {
            maxWidth: "100%",
            maxHeight: "100%",
            borderRadius: "10px",
        },
            terastalContainer: {
            marginTop: "10px",
        },
            terastalImage: {
            width: "40px",
            height: "40px",
        },
            infoContainer: {
            marginTop: "10px",
        },
            infoRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#eee",
            padding: "5px", // 5pxから8pxに変更（余白を増やす）
            borderRadius: "5px",
            fontSize: "12px",
            marginBottom: "6px", // 各項目の間隔を少し広げる
        },

            label: {
            fontWeight: "bold",
            color: "#333",
        },
            value: {
            color: "#555",
        },
            buttonPrimary: {
            padding: "10px",
            fontSize: "16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px",
        },
            buttonSecondary: {
            padding: "10px",
            fontSize: "16px",
            backgroundColor: "#888",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginLeft: "10px",
        },
            buttonEdit: {
            backgroundColor: "#4CAF50",
            color: "white",
        },
            buttonDelete: {
            backgroundColor: "#f44336",
            color: "white",
            marginLeft: "10px",
        },
            commentBox: {
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.5)", // 透明度50%の白
        },
                commentBox2: {
                    border: "1px solid #ccc",
                    padding: "10px",
                    borderRadius: "5px",
                    marginBottom: "10px",
                    backgroundColor: "white", // 透明度50%の白
                },
        };
