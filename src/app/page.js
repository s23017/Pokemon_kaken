"use client"; // クライアントコンポーネントとして宣言

import Link from 'next/link';

const TopPage = () => {
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>ポケモンSNSアプリ</h1>
            <p>各機能へのリンクを選択してください:</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ margin: '10px 0' }}>
                    <Link href="/party-builder">
                        <button style={{ padding: '10px 20px', fontSize: '16px' }}>パーティー構築</button>
                    </Link>
                </li>
                <li style={{ margin: '10px 0' }}>
                    <Link href="/speed-comparison">
                        <button style={{ padding: '10px 20px', fontSize: '16px' }}>素早さ比較</button>
                    </Link>
                </li>
                <li style={{ margin: '10px 0' }}>
                    <Link href="/damage-calculator">
                        <button style={{ padding: '10px 20px', fontSize: '16px' }}>ダメージ計算</button>
                    </Link>
                </li>
                <li style={{ margin: '10px 0' }}>
                    <Link href="/zukan">
                        <button style={{ padding: '10px 20px', fontSize: '16px' }}>図鑑</button>
                    </Link>
                </li>
                <li style={{ margin: '10px 0' }}>
                    <Link href="/sns">
                        <button style={{ padding: '10px 20px', fontSize: '16px' }}>SNS</button>
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default TopPage;