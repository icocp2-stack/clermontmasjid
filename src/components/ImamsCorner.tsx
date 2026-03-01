import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookOpen, Calendar, User, Video as VideoIcon } from 'lucide-react';
import Navigation from './Navigation';

interface Post {
  id: string;
  title: string;
  content: string;
  post_type: string;
  author_name: string;
  published_at: string;
}

interface Video {
  id: string;
  video_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
}

export default function ImamsCorner() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'videos'>('posts');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data: postsData } = await supabase
      .from('imam_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    const { data: videosData } = await supabase
      .from('imam_youtube_videos')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    setPosts(postsData || []);
    setVideos(videosData || []);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-6">
        <header className="mb-6 md:mb-8">
          <div className="text-center mb-6 md:mb-8">
            <img
              src="/logo-9.png"
              alt="ICOC Logo"
              className="w-32 h-auto md:w-40 lg:w-48 mx-auto mb-4"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4)) drop-shadow(0 2px 10px rgba(0, 0, 0, 0.3))' }}
            />
            <h1
              className="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-500 mb-2"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), -1px -1px 2px rgba(255, 255, 255, 0.1), 0 4px 8px rgba(0, 0, 0, 0.3)' }}
            >
              ISLAMIC CENTER OF CLERMONT
            </h1>
            <p className="text-base md:text-lg text-white font-medium">Guidance from the Minbar</p>
          </div>
        </header>

        <Navigation currentPage="imams-corner" />

        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-emerald-900/30 rounded-full mb-4">
            <BookOpen className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Guidance from the Minbar</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Spiritual guidance, insights, and resources from our Imam
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-800 rounded-lg shadow-sm p-1 border border-slate-700">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'posts'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Posts & Articles
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'videos'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <VideoIcon className="w-4 h-4 inline mr-2" />
              Videos
            </button>
          </div>
        </div>

        {activeTab === 'posts' && (
          <div>
            {selectedPost ? (
              <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-12 text-white">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-emerald-100 hover:text-white mb-4 text-sm"
                  >
                    ← Back to all posts
                  </button>
                  <h1 className="text-3xl font-bold mb-3">{selectedPost.title}</h1>
                  <div className="flex items-center gap-4 text-emerald-100">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedPost.author_name}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedPost.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="px-8 py-10">
                  <div className="prose prose-lg max-w-none">
                    {selectedPost.content.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="text-slate-300 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {posts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group border border-slate-700"
                  >
                    <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className="px-3 py-1 bg-emerald-900/50 text-emerald-300 text-xs font-semibold rounded-full">
                          {post.post_type}
                        </span>
                        <span className="text-sm text-slate-400 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.published_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-slate-300 line-clamp-3 mb-4">
                        {post.content.substring(0, 200)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {post.author_name}
                        </span>
                        <span className="text-emerald-400 font-medium text-sm group-hover:underline">
                          Read more →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!selectedPost && posts.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No posts available yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map(video => (
              <div key={video.id} className="bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-slate-700">
                <div className="relative group">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={`https://www.youtube.com/watch?v=${video.video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 flex items-center gap-2"
                    >
                      <VideoIcon className="w-5 h-5" />
                      Watch on YouTube
                    </a>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-slate-300 line-clamp-3">{video.description}</p>
                  )}
                </div>
              </div>
            ))}

            {videos.length === 0 && (
              <div className="col-span-full text-center py-16">
                <VideoIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No videos available yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
