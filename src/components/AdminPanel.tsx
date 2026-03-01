import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Shield, Users, Plus, Trash2, Home, Mail, Check, Edit, BookOpen, Video, Save, X, Clock } from 'lucide-react';
import EditablePrayerTimes from './EditablePrayerTimes';

interface AppUser {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  can_manage_posts: boolean;
  can_manage_videos: boolean;
  created_at: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  post_type: string;
  author_name: string;
  is_published: boolean;
  published_at: string;
}

interface YouTubeVideo {
  id: string;
  video_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  is_active: boolean;
  display_order: number;
}

const MOSQUE_LOCATION = {
  latitude: 28.5494,
  longitude: -81.7729,
  city: 'Clermont',
  state_province: 'FL',
  country: 'United States',
  postal_code: '34711',
  timezone: 'America/New_York'
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'videos' | 'prayer-times'>('users');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [users, setUsers] = useState<AppUser[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [canManagePosts, setCanManagePosts] = useState(false);
  const [canManageVideos, setCanManageVideos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invitationMessage, setInvitationMessage] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState({
    is_admin: false,
    can_manage_posts: false,
    can_manage_videos: false
  });
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');

  useEffect(() => {
    if (role.isAdmin) {
      loadUsers();
      loadPosts();
      loadVideos();
    }
  }, [role.isAdmin]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async () => {
    if (!newEmail.trim() || !newPassword.trim()) {
      alert('Please provide both email and password');
      return;
    }

    if (!isAdmin && !canManagePosts && !canManageVideos) {
      alert('Please select at least one permission for this user');
      return;
    }

    try {
      const email = newEmail.trim().toLowerCase();

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: newPassword.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        const { error: insertError } = await supabase.from('app_users').insert({
          user_id: authData.user.id,
          email,
          name: newName.trim() || '',
          is_admin: isAdmin,
          can_manage_posts: canManagePosts,
          can_manage_videos: canManageVideos
        });

        if (insertError) throw insertError;

        const permissions: string[] = [];
        if (isAdmin) permissions.push('Admin (full access)');
        if (canManagePosts) permissions.push('Manage Posts');
        if (canManageVideos) permissions.push('Manage Videos');

        setInvitationMessage(
          `User account created successfully!\n\nSend this information to the user:\n\nEmail: ${email}\nPassword: ${newPassword}\nPermissions: ${permissions.join(', ')}\nLogin Link: ${window.location.origin}/`
        );

        setNewEmail('');
        setNewPassword('');
        setNewName('');
        setIsAdmin(false);
        setCanManagePosts(false);
        setCanManageVideos(false);
        loadUsers();
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Remove this user? This will delete their account and all associated data.')) return;

    try {
      const { error } = await supabase
        .from('app_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const startEditingUser = (user: AppUser) => {
    setEditingUserId(user.id);
    setEditPermissions({
      is_admin: user.is_admin,
      can_manage_posts: user.can_manage_posts,
      can_manage_videos: user.can_manage_videos
    });
  };

  const cancelEditingUser = () => {
    setEditingUserId(null);
    setEditPermissions({
      is_admin: false,
      can_manage_posts: false,
      can_manage_videos: false
    });
  };

  const saveUserPermissions = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('app_users')
        .update({
          is_admin: editPermissions.is_admin,
          can_manage_posts: editPermissions.can_manage_posts,
          can_manage_videos: editPermissions.can_manage_videos
        })
        .eq('id', userId);

      if (error) throw error;
      setEditingUserId(null);
      loadUsers();
      alert('Permissions updated successfully');
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Failed to update permissions');
    }
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('imam_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('imam_youtube_videos')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/,
      /youtube\.com\/v\/([^&\s]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const addVideo = async () => {
    if (!videoUrl.trim()) {
      alert('Please provide a YouTube URL');
      return;
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      alert('Invalid YouTube URL. Please use a valid YouTube video link.');
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in to add videos');
        return;
      }

      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      const maxOrder = videos.length > 0 ? Math.max(...videos.map(v => v.display_order)) : 0;

      const { error } = await supabase
        .from('imam_youtube_videos')
        .insert({
          video_id: videoId,
          title: videoTitle.trim() || 'Untitled Video',
          description: videoDescription.trim() || '',
          thumbnail_url: thumbnailUrl,
          is_active: true,
          display_order: maxOrder + 1,
          added_by: user.id
        });

      if (error) throw error;

      setVideoUrl('');
      setVideoTitle('');
      setVideoDescription('');
      loadVideos();
      alert('Video added successfully!');
    } catch (error: any) {
      console.error('Error adding video:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));

      // Check user permissions
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: appUser } = await supabase
          .from('app_users')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        console.log('Current user:', user.id);
        console.log('App user permissions:', appUser);
      }

      alert(`Error: ${error.message}`);
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (!confirm('Delete this video?')) return;

    try {
      const { error } = await supabase
        .from('imam_youtube_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
      loadVideos();
      alert('Video deleted successfully!');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  const toggleVideoStatus = async (videoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('imam_youtube_videos')
        .update({ is_active: !currentStatus })
        .eq('id', videoId);

      if (error) throw error;
      loadVideos();
    } catch (error) {
      console.error('Error toggling video status:', error);
      alert('Failed to update video status');
    }
  };

  if (!role.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">You do not have admin privileges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Shield className="w-8 h-8" />
                  Admin Panel
                </h1>
                <p className="text-blue-100 mt-2">Manage users and permissions</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                >
                  <Home className="w-5 h-5" />
                  Home
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'users'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'posts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Posts
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'videos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Video className="w-4 h-4" />
                Videos
              </button>
              <button
                onClick={() => setActiveTab('prayer-times')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'prayer-times'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                Prayer Times
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <>
                <div className="mb-6 bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Add New User
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="User email address"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Display name (optional)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <input
                  type="password"
                  placeholder="Temporary password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Permissions:</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isAdmin}
                        onChange={(e) => setIsAdmin(e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-gray-900 font-medium group-hover:text-blue-600">Admin</span>
                        <p className="text-sm text-gray-500">Full access to admin panel</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={canManagePosts}
                        onChange={(e) => setCanManagePosts(e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-gray-900 font-medium group-hover:text-blue-600">Can manage Posts</span>
                        <p className="text-sm text-gray-500">Create, edit, and delete posts</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={canManageVideos}
                        onChange={(e) => setCanManageVideos(e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-gray-900 font-medium group-hover:text-blue-600">Can manage Videos</span>
                        <p className="text-sm text-gray-500">Add and remove YouTube videos</p>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={addUser}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Add User
                </button>
              </div>
            </div>

            {invitationMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">User Created</h3>
                <pre className="text-sm text-green-800 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-green-200">
                  {invitationMessage}
                </pre>
                <button
                  onClick={() => setInvitationMessage(null)}
                  className="mt-3 text-sm text-green-700 hover:text-green-900 font-medium"
                >
                  Dismiss
                </button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Users</h3>
                {users.map(user => (
                  <div key={user.id} className="bg-gray-50 p-5 rounded-lg hover:bg-gray-100 transition-colors">
                    {editingUserId === user.id ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{user.email}</p>
                            {user.name && (
                              <span className="text-sm text-gray-600">({user.name})</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveUserPermissions(user.id)}
                              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Save className="w-4 h-4" />
                              Save
                            </button>
                            <button
                              onClick={cancelEditingUser}
                              className="flex items-center gap-1 px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">Edit Permissions:</p>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editPermissions.is_admin}
                              onChange={(e) => setEditPermissions({ ...editPermissions, is_admin: e.target.checked })}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div>
                              <span className="text-gray-900 font-medium">Admin</span>
                              <p className="text-sm text-gray-500">Full access to admin panel</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editPermissions.can_manage_posts}
                              onChange={(e) => setEditPermissions({ ...editPermissions, can_manage_posts: e.target.checked })}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div>
                              <span className="text-gray-900 font-medium">Can manage Posts</span>
                              <p className="text-sm text-gray-500">Create, edit, and delete posts</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editPermissions.can_manage_videos}
                              onChange={(e) => setEditPermissions({ ...editPermissions, can_manage_videos: e.target.checked })}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div>
                              <span className="text-gray-900 font-medium">Can manage Videos</span>
                              <p className="text-sm text-gray-500">Add and remove YouTube videos</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-gray-900 text-lg">{user.email}</p>
                            {user.name && (
                              <span className="text-sm text-gray-600">({user.name})</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {user.is_admin && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                <Check className="w-3 h-3" />
                                Admin
                              </span>
                            )}
                            {user.can_manage_posts && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                <Check className="w-3 h-3" />
                                Can manage Posts
                              </span>
                            )}
                            {user.can_manage_videos && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                <Check className="w-3 h-3" />
                                Can manage Videos
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Added {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditingUser(user)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No users found. Add your first user above.
                  </div>
                )}
              </div>
            )}
              </>
            )}

            {activeTab === 'posts' && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Coming Soon</h3>
                  <p className="text-yellow-800">Post management interface will be available here. You can create, edit, and publish posts for Guidance from the Minbar.</p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">All Posts</h3>
                  {posts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No posts found</div>
                  ) : (
                    posts.map(post => (
                      <div key={post.id} className="bg-gray-50 p-5 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg mb-1">{post.title}</h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.content}</p>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">By {post.author_name}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(post.published_at).toLocaleDateString()}
                              </span>
                              {post.is_published && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                  Published
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Add YouTube Video
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube Video URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Paste any YouTube video URL</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video Title
                      </label>
                      <input
                        type="text"
                        placeholder="Enter video title"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        placeholder="Enter video description"
                        value={videoDescription}
                        onChange={(e) => setVideoDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={addVideo}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold"
                    >
                      <Plus className="w-5 h-5" />
                      Add Video
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">All Videos</h3>
                  {videos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No videos found. Add your first video above.</div>
                  ) : (
                    videos.map(video => (
                      <div key={video.id} className="bg-gray-50 p-5 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-start gap-4">
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-32 h-20 object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`;
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{video.title}</h4>
                            {video.description && (
                              <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                            )}
                            <div className="flex items-center gap-3">
                              <a
                                href={`https://www.youtube.com/watch?v=${video.video_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                View on YouTube
                              </a>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                video.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-200 text-gray-600'
                              }`}>
                                {video.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleVideoStatus(video.id, video.is_active)}
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                              title={video.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {video.is_active ? '👁️' : '👁️‍🗨️'}
                            </button>
                            <button
                              onClick={() => deleteVideo(video.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'prayer-times' && (
              <div className="space-y-6">
                <EditablePrayerTimes location={MOSQUE_LOCATION} currentTime={currentTime} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
