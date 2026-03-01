import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FileText, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  post_type: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function ImamDashboard() {
  const { role, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', post_type: 'article' });

  useEffect(() => {
    if (role.canManagePosts && user) {
      loadPosts();
    }
  }, [role.canManagePosts, user]);

  const loadPosts = async () => {
    const { data } = await supabase
      .from('imam_posts')
      .select('*')
      .eq('author_id', user?.id)
      .order('created_at', { ascending: false });
    setPosts(data || []);
  };

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    const userData = await supabase
      .from('app_users')
      .select('name')
      .eq('user_id', user?.id)
      .maybeSingle();

    await supabase.from('imam_posts').insert({
      title: newPost.title,
      content: newPost.content,
      post_type: newPost.post_type,
      author_id: user?.id,
      author_name: userData?.data?.name || user?.email,
      is_published: false
    });

    setNewPost({ title: '', content: '', post_type: 'article' });
    loadPosts();
  };

  const updatePost = async () => {
    if (!editingPost) return;

    await supabase
      .from('imam_posts')
      .update({
        title: editingPost.title,
        content: editingPost.content,
        post_type: editingPost.post_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingPost.id);

    setEditingPost(null);
    loadPosts();
  };

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await supabase.from('imam_posts').delete().eq('id', id);
    loadPosts();
  };

  const togglePublish = async (post: Post) => {
    await supabase
      .from('imam_posts')
      .update({
        is_published: !post.is_published,
        published_at: !post.is_published ? new Date().toISOString() : null
      })
      .eq('id', post.id);
    loadPosts();
  };

  if (!role.canManagePosts) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-slate-900 rounded-lg shadow-lg overflow-hidden border border-slate-800">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="w-7 h-7" />
              Post Management
            </h2>
            <p className="text-green-100 mt-2">Create and manage your posts</p>
          </div>
        </div>

          <div className="p-6">
            <div className="mb-8 bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Create New Post</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Post title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 placeholder-slate-400"
                />
                <select
                  value={newPost.post_type}
                  onChange={(e) => setNewPost({ ...newPost, post_type: e.target.value })}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="article">Article</option>
                  <option value="announcement">Announcement</option>
                  <option value="document">Document</option>
                </select>
                <textarea
                  placeholder="Post content (markdown supported)"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 placeholder-slate-400"
                />
                <button
                  onClick={createPost}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Post
                </button>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-white mb-4">Your Posts</h2>
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                  {editingPost?.id === post.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingPost.title}
                        onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      <textarea
                        value={editingPost.content}
                        onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                        rows={6}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={updatePost}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingPost(null)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-lg">{post.title}</h3>
                          <p className="text-sm text-slate-300 mt-2">{post.content.substring(0, 150)}...</p>
                          <div className="flex gap-2 mt-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              post.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {post.is_published ? 'Published' : 'Draft'}
                            </span>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {post.post_type}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => togglePublish(post)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                              post.is_published
                                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {post.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => setEditingPost(post)}
                            className="text-blue-600 hover:text-blue-700 p-2"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}
