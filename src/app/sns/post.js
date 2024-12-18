"use client";

import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

export default function SNSPage() {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData);
        });

        return () => unsubscribe();
    }, []);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        let imageUrl = '';

        if (image) {
            const imageRef = ref(storage, `images/${image.name}`);
            await uploadBytes(imageRef, image);
            imageUrl = await getDownloadURL(imageRef);
        }

        await addDoc(collection(db, 'posts'), {
            content,
            imageUrl,
            timestamp: Date.now(),
        });

        setContent('');
        setImage(null);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>SNS App</h1>
            <form onSubmit={handlePostSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    rows="3"
                    style={{ width: '100%', marginBottom: '10px' }}
                />
                <input
                    type="file"
                    onChange={(e) => setImage(e.target.files[0])}
                    style={{ display: 'block', marginBottom: '10px' }}
                />
                <button type="submit">Post</button>
            </form>

            <div style={{ marginTop: '20px' }}>
                <h2>Posts</h2>
                {posts.map((post) => (
                    <div key={post.id} style={{ border: '1px solid #ccc', marginBottom: '10px', padding: '10px' }}>
                        <p>{post.content}</p>
                        {post.imageUrl && <img src={post.imageUrl} alt="Post" style={{ maxWidth: '100%' }} />}
                    </div>
                ))}
            </div>
        </div>
    );
}
