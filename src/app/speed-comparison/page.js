"use client";

import { useState, useEffect } from 'react';
import { fetchPokemonBaseStats } from '../api/pokemon';

const BulbasaurStatsPage = () => {
    const [stats, setStats] = useState([]);
    const [error, setError] = useState(null);

    // フシギダネの種族値を取得する関数
    const fetchStats = async () => {
        try {
            const baseStats = await fetchPokemonBaseStats("bulbasaur");
            setStats(baseStats);
        } catch (err) {
            setError(err.message);
        }
    };

    // 初回レンダリング時にデータを取得
    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>フシギダネの種族値</h1>
            {error ? (
                <p style={{ color: 'red' }}>エラーが発生しました: {error}</p>
            ) : stats.length === 0 ? (
                <p>読み込み中...</p>
            ) : (
                <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '50%' }}>
                    <thead>
                    <tr>
                        <th>ステータス</th>
                        <th>種族値</th>
                    </tr>
                    </thead>
                    <tbody>
                    {stats.map((stat) => (
                        <tr key={stat.name}>
                            <td>{stat.name}</td>
                            <td>{stat.base_stat}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default BulbasaurStatsPage;
