"use client"; // クライアントコンポーネントとして宣言

import Link from "next/link";
import Image from "next/image";

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
                            alt="s.png"
                            style={{
                                cursor: "pointer",
                            }}
                        />
                    </Link>
                </div>
                <h1 className="header-title">ポケモンSNSアプリ</h1>
            </header>

            {/* メインコンテンツ */}
            <div
                style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    marginTop: "150px",
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
                        {href: "/speed-comparison", label: "スピード比較", img: "/images/bata2.png"},
                        {href: "/damage-calculator", label: "ダメージ計算", img: "/images/bana.png"},
                        {href: "/zukan", label: "図鑑", img: "/images/riza-don.png"},
                        {href: "/sns", label: "SNS", img: "/images/kamex.png"},
                    ].map(({href, label, img}, index) => (
                        <div key={index} style={{textAlign: "center"}}>
                            <Link href={href}>
                                <div style={{display: "inline-block", position: "relative"}}>
                                    {/* モンスターボール */}
                                    <div className="pokeball">
                                        <div className="pokeball__top"/>
                                        <div className="pokeball__bottom"/>
                                        <div className="pokeball__button"/>
                                        {/* 隠された画像 */}
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
            </div>

            <style jsx>{`

                @font-face {
                    font-family: "PokemonGB";
                    src: url("/font/pokemon-gb-font/pkmn_s.ttf") format("truetype");
                    font-weight: normal;
                    font-style: normal;
                }

                //@font-face {
                //    font-family: "PokemonGB";
                //    src: url("/font/pokemon-gb-font/PokemonUnownGb-YAWa.ttf") format("truetype");
                //    font-weight: normal;
                //    font-style: normal;
                //}

                /* すべての要素にフォントを適用 */
                * {
                    font-family: "pokemon-gb-font", sans-serif;
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
                    background-color: #000;
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
                    opacity: 0; /* 最初は非表示 */
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                }

                .pokeball:hover .pokeball__content {
                    opacity: 1; /* ホバー時に画像を表示 */
                }
            `}</style>

        </div>
    );
};

export default TopPage;
