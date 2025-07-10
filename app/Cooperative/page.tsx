'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Comment, Post } from '@/types';
import { Input, Textarea, Button } from '@heroui/react';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [author, setAuthor] = useState('');
  const [newComment, setNewComment] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    const qPosts = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubPosts = onSnapshot(qPosts, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(data);
    });

    const qComments = query(collection(db, 'comments'), orderBy('createdAt'));
    const unsubComments = onSnapshot(qComments, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(data);
    });

    return () => {
      unsubPosts();
      unsubComments();
    };
  }, []);

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    await addDoc(collection(db, 'posts'), {
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      createdAt: Timestamp.now().toMillis()
    });

    setNewPostTitle('');
    setNewPostContent('');
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !author.trim() || !selectedPost) return;

    await addDoc(collection(db, 'comments'), {
      postId: selectedPost.id,
      parentId: replyTo || null,
      author: author.trim(),
      text: newComment.trim(),
      createdAt: Timestamp.now().toMillis()
    });

    setNewComment('');
    setReplyTo(null);
  };

  const renderComments = (postId: string, parentId: string | null = null): JSX.Element[] => {
    return comments
      .filter(c => c.postId === postId && c.parentId === parentId)
      .map(c => (
        <div key={c.id} className='ml-4 mt-2 border-l-2 border-gray-300 pl-4'>
          <p className='text-sm'>
            <b>{c.author}</b>: {c.text}
          </p>
          <Button
            color='danger'
            variant='shadow'
            radius='none'
            className='text-2p'
            onPress={() => setReplyTo(c.id)}
          >
            Reply
          </Button>
          {renderComments(postId, c.id)}
        </div>
      ));
  };

  return (
    <main className='min-h-screen bg-black p-6'>
      <div className='max-w-3xl mx-auto'>
        <h1 className='text-3xl font-bold mb-6 text-center text-2p text-white'>BLOG IN REAL TIME</h1>
        <p className='text-poppins my-10'>
          This blog is a cooperative section. It was created to share opinions about the game and chat, as it's very important.
        </p>

        {/* Crear publicación */}
        <section className='bg-purple-600 p-4 rounded-xl shadow mb-6'>
          <h2 className='text-xl font-semibold mb-4 text-2p'>CREATE NEW POST</h2>
          <Input
            isRequired
            type='text'
            className='w-full px-3 py-2 mb-2 text-poppins'
            label='Post Title'
            radius='none'
            value={newPostTitle}
            onChange={e => setNewPostTitle(e.target.value)}
          />
          <Textarea
            className='w-full px-3 py-2 mb-2 text-poppins'
            radius='none'
            label='Post Content'
            value={newPostContent}
            onChange={e => setNewPostContent(e.target.value)}
          />
          <Button
            color='danger'
            variant='shadow'
            radius='none'
            className='text-2p w-full'
            onPress={handleCreatePost}
          >
            Post
          </Button>
        </section>

        {/* Lista de publicaciones */}
        {posts.length === 0 ? (
          <p className='text-center text-white text-poppins'>There are no posts yet.</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className='bg-white p-4 rounded shadow mb-6 text-black'>
              <h2 className='text-xl font-semibold text-poppins'>{post.title}</h2>
              <p className='mb-4 text-poppins'>{post.content}</p>
              <button
                className='text-poppins text-black'
                onClick={() =>
                  setSelectedPost(selectedPost?.id === post.id ? null : post)
                }
              >
                {selectedPost?.id === post.id ? 'Hide Comments' : 'See Comments'}
              </button>
            </div>
          ))
        )}

        {/* Sección de comentarios */}
        {selectedPost && (
          <section className='bg-white p-4 rounded shadow mt-6'>
            <div className='my-10 text-black text-poppins'>
              {renderComments(selectedPost.id)}
            </div>
            <h3 className='text-xl text-center text-black text-2p font-semibold mb-4'>
              Comments for: {selectedPost.title}
            </h3>

            <Input
              isRequired
              type='text'
              className='w-full px-3 py-2 mb-2 text-poppins'
              label='Your Name'
              radius='none'
              value={author}
              onChange={e => setAuthor(e.target.value)}
            />
            <Textarea
              className='w-full px-3 py-2 mb-2 text-poppins'
              radius='none'
              label={replyTo ? 'Responding...' : 'Write a comment'}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <Button
              color='danger'
              variant='shadow'
              radius='none'
              className='text-2p w-full'
              onPress={handleCommentSubmit}
            >
              Submit Comment
            </Button>
          </section>
        )}
      </div>
    </main>
  );
}
