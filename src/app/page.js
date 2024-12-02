"use client"; // クライアントコンポーネントとして宣言

import Link from "next/link";
import Image from "next/legacy/image";

const TopPage = () => {
    return (
        <div>
            {/* ヘッダー */}
            <header
                style={{
                    backgroundColor: "#FF0000",
                    color: "white",
                    textAlign: "center",
                    padding: "20px 0",
                    position: "relative",
                }}
            >
                <h1 style={{fontSize: "24px", margin: 0}}>ポケモンSNSアプリ</h1>
                {/* モンスターボール模様 */}
                <div
                    style={{
                        width: "50px",
                        height: "50px",
                        background: "linear-gradient(to bottom, #FF0000 50%, #FFF 50%)",
                        borderRadius: "50%",
                        position: "absolute",
                        bottom: "-25px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        border: "3px solid #000",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {/* モンスターボールの中央ボタン */}
                    <div
                        style={{
                            width: "16px",
                            height: "16px",
                            backgroundColor: "#FFF",
                            borderRadius: "50%",
                            border: "3px solid #000",
                        }}
                    />
                </div>
                <Link href="/">
                    <Image
                        src="/public/images/s.png"
                        width={50}
                        height={50}
                        alt="s.png"
                        style={{
                            marginRight: "10px",
                            cursor: "pointer",
                        }}
                    />
                </Link>
            </header>

            {/* メインコンテンツ */}
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p>各機能へのリンクを選択してください:</p>
                <ul style={{ listStyle: "none", padding: 0 }}>
                    <li style={{ margin: "10px 0" }}>
                        <Link href="/party-builder">
                            <button
                                style={{
                                    padding: "10px 20px",
                                    fontSize: "16px",
                                    backgroundColor: "#FF4500",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                            >
                                パーティー構築
                            </button>
                        </Link>
                    </li>
                    <li style={{ margin: "10px 0" }}>
                        <Link href="/speed-comparison">
                            <button
                                style={{
                                    padding: "10px 20px",
                                    fontSize: "16px",
                                    backgroundColor: "#FF4500",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                            >
                                素早さ比較
                            </button>
                        </Link>
                    </li>
                    <li style={{ margin: "10px 0" }}>
                        <Link href="/damage-calculator">
                            <button
                                style={{
                                    padding: "10px 20px",
                                    fontSize: "16px",
                                    backgroundColor: "#FF4500",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                            >
                                ダメージ計算
                            </button>
                        </Link>
                    </li>
                    <li style={{ margin: "10px 0" }}>
                        <Link href="/zukan">
                            <button
                                style={{
                                    padding: "10px 20px",
                                    fontSize: "16px",
                                    backgroundColor: "#FF4500",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                            >
                                図鑑
                            </button>
                        </Link>
                    </li>
                    <li style={{ margin: "10px 0" }}>
                        <Link href="/sns">
                            <button
                                style={{
                                    padding: "10px 20px",
                                    fontSize: "16px",
                                    backgroundColor: "#FF4500",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                            >
                                SNS
                            </button>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default TopPage;
