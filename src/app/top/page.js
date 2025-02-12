"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app"; // Firebase初期化用
import { getAuth, signOut } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH,
    projectId: process.env.NEXT_PUBLIC_PRO,
    storageBucket: process.env.NEXT_PUBLIC_BUKET,
    messagingSenderId: process.env.NEXT_PUBLIC_POKEMON_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
// const handleLogout = async () => {
//     try {
//         await signOut(auth);
//         router.push("/"); // ログアウト後ログインページへリダイレクト
//     } catch (error) {
//         console.error("ログアウト失敗:", error);
//     }
// };
const TopPage = () => {
    const router = useRouter();
    const auth = getAuth();
    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/"); // ログアウト後ログインページへリダイレクト
        } catch (error) {
            console.error("ログアウト失敗:", error);
        }
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

            {/* ヘッダーを固定表示 */}
            <header
                style={{
                    backgroundColor: "#FF0000",
                    color: "white",
                    textAlign: "center",
                    padding: "20px 0",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
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
                        <div>
                            <Image
                                src="/images/gaming.gif"
                                width={50}
                                height={50}
                                alt="s.png"
                                style={{
                                    cursor: "pointer",
                                }}
                            />
                        </div>
                    </Link>
                </div>
                <h1 className="header-title">POKEWORLD</h1>

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
            <main
                style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    paddingTop: "180px",  // ヘッダーの高さ分だけ余白を追加                       paddingTop: "80px",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <p style={{marginBottom: "40px", fontSize: "18px", fontWeight: "bold"}}>
                    各機能へのリンクを選択してください:
                </p>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "50px",
                    }}
                >
                    {[
                        {href: "/party-builder", label: "パーティ構築", img: "/images/pikacyuuuuu.png"},
                        {href: "/speed-comparison", label: "クイズ", img: "/images/bata2.png"},
                        {href: "/damage-calculator", label: "ダメージ計算", img: "/images/bana.png"},
                        {href: "/zukan", label: "図鑑", img: "/images/riza-don.png"},
                        {href: "/sns/post", label: "SNS", img: "/images/kamex.png"},
                    ].map(({href, label, img}, index) => (
                        <div key={index} style={{textAlign: "center"}}>
                            <Link href={href}>
                                <div style={{display: "inline-block", position: "relative"}}>
                                    <div className="pokeball">
                                        <div className="pokeball__top"/>
                                        <div className="pokeball__bottom"/>
                                        <div className="pokeball__button"/>
                                        <div className="pokeball__content">
                                            <Image
                                                src={img}
                                                alt={label}
                                                layout="fill"
                                                objectFit="contain"
                                                style={{
                                                    display: "block",
                                                    position: "absolute",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            <p className="menu-label">{label}</p>
                        </div>
                    ))}
                </div>
            </main>

            <style jsx>{`
                @font-face {
                    font-family: "PokemonGB";
                    src: url("/font/pokemon-gb-font/pkmn_s.ttf") format("truetype");
                    font-weight: normal;
                    font-style: normal;
                }

                * {
                    font-family: "PokemonGB", sans-serif;
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                html, body {
                    margin: 0;
                    padding: 0;
                    width: 100vw;
                    height: 100vh;
                    overflow-x: hidden;
                }

                .header-title {
                    font-size: 24px;
                }

                .menu-label {
                    font-size: 18px;
                }

                .pokeball {
                    width: 120px;
                    height: 120px;
                    position: relative;
                    cursor: pointer;
                    transition: transform 0.3s ease;
                }

                .pokeball:hover {
                    transform: scale(1.1);
                }

                .pokeball__top {
                    width: 100%;
                    height: 50%;
                    background-color: #ff0000;
                    border-top-left-radius: 50%;
                    border-top-right-radius: 50%;
                    position: absolute;
                    top: 0;
                    z-index: 1;
                    transition: transform 0.3s ease;
                }

                .pokeball__bottom {
                    width: 100%;
                    height: 50%;
                    background-color: #ffffff;
                    border-bottom-left-radius: 50%;
                    border-bottom-right-radius: 50%;
                    position: absolute;
                    bottom: 0;
                    z-index: 1;
                    transition: transform 0.3s ease;
                }

                .pokeball__button {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 20px;
                    height: 20px;
                    background-color: #fff;
                    border: 3px solid #000;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 2;
                    transition: transform 0.3s ease;
                }

                .pokeball__content {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 3;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                }

                .pokeball:hover .pokeball__content {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default TopPage;