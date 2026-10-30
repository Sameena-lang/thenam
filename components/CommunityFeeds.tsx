'use client'

import { useState } from 'react'
import {
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  Play,
  CheckCircle2,
  ThumbsUp,
  Repeat2,
  Send,
  Sparkles,
  Users,
  Eye,
  Film,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

type FilterTab = 'all' | 'instagram' | 'linkedin' | 'youtube'

export default function CommunityFeeds() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const instagramPosts = [
    {
      id: 'ig-1',
      image: '/social/insta-analyst.jpg',
      badge: 'HIRING',
      title: 'We Are Hiring! Business Analyst Intern',
      subtitle: 'Analyze. Solve. Make an Impact.',
      likes: 128,
      comments: 19,
      tag: '#internship',
      url: 'https://www.instagram.com/thenam_software_solutions/',
    },
    {
      id: 'ig-2',
      image: '/social/insta-dev.jpg',
      badge: 'CAREERS',
      title: 'We Are Hiring! Full Stack Developer',
      subtitle: 'Build. Code. Create. Grow! React · Next.js · Node.js',
      likes: 174,
      comments: 26,
      tag: '#fullstack',
      url: 'https://www.instagram.com/thenam_software_solutions/',
    },
    {
      id: 'ig-3',
      image: '/social/insta-placement.jpg',
      badge: 'SUCCESS',
      title: 'Congratulations Naveen K',
      subtitle: 'Placed as Junior Backend Developer',
      likes: 215,
      comments: 34,
      tag: '#placement',
      url: 'https://www.instagram.com/thenam_software_solutions/',
    },
  ]

  const youtubeVideos = [
    {
      id: 'yt-1',
      thumb: '/social/yt-ai-agents.jpg',
      title: 'Building Real-Time AI Agents & Multi-Platform Web Apps',
      badge: '1080p Ultra HD',
      duration: '14:20',
      views: '1.4k views',
      time: '2 weeks ago',
      category: 'AI Architecture',
      url: 'https://www.youtube.com/@Thenamsoftwaresolutions-v9w',
    },
    {
      id: 'yt-2',
      thumb: '/social/yt-cloud-arch.jpg',
      title: 'Next-Gen Cloud Architecture & Microservices Deployment',
      badge: '60fps HD',
      duration: '11:45',
      views: '980 views',
      time: '1 month ago',
      category: 'Cloud Engineering',
      url: 'https://www.youtube.com/@Thenamsoftwaresolutions-v9w',
    },
  ]

  const linkedinUpdates = [
    {
      id: 'li-1',
      date: '3d ago',
      text: '🚀 We are expanding our core team in Chennai! Now accepting applications for Full Stack Developers & Business Analyst Interns to architect intelligent AI ecosystems and high-velocity web apps.',
      tags: ['#AI', '#SoftwareEngineering', '#ChennaiTech', '#Hiring'],
      likes: 84,
      comments: 12,
      reposts: 8,
      url: 'https://www.linkedin.com/company/thenam-software-solutions/posts/?feedView=all',
    },
    {
      id: 'li-2',
      date: '1w ago',
      text: '✨ From concept to deployment in 72 hours. Our latest cloud-native Next.js enterprise portal achieved 99.9% uptime with 98+ Google Lighthouse performance benchmarks.',
      tags: ['#CloudNative', '#Nextjs', '#WebEngineering', '#Enterprise'],
      likes: 112,
      comments: 18,
      reposts: 14,
      url: 'https://www.linkedin.com/company/thenam-software-solutions/posts/?feedView=all',
    },
  ]

  return (
    <section className="community-feeds-section" id="community" aria-label="Social media feeds and community">
      {/* Background ambient lighting */}
      <div className="community-glow-cyan" aria-hidden="true" />
      <div className="community-glow-lime" aria-hidden="true" />

      <div className="container community-container">
        {/* Section Header matching the user reference */}
        <div className="community-header">
          <div className="community-pill-badge">
            <span className="pulse-dot-lime" />
            <span>SOCIAL FEEDS</span>
          </div>

          <h2 className="community-title">
            Connect With Our <span className="accent-lime">Community</span>
          </h2>

          <p className="community-subtitle">
            Stay updated with our latest projects, tech insights, and behind-the-scenes moments across Instagram, LinkedIn, and YouTube.
          </p>

          {/* Channel Filter Tabs */}
          <div className="community-tabs-row" role="tablist">
            <button
              type="button"
              className={`community-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
              role="tab"
              aria-selected={activeTab === 'all'}
            >
              <span>All Feeds</span>
              <span className="tab-count-badge">3</span>
            </button>
            <button
              type="button"
              className={`community-tab-btn tab-insta ${activeTab === 'instagram' ? 'active' : ''}`}
              onClick={() => setActiveTab('instagram')}
              role="tab"
              aria-selected={activeTab === 'instagram'}
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Instagram</span>
            </button>
            <button
              type="button"
              className={`community-tab-btn tab-linkedin ${activeTab === 'linkedin' ? 'active' : ''}`}
              onClick={() => setActiveTab('linkedin')}
              role="tab"
              aria-selected={activeTab === 'linkedin'}
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75c.97 0 1.76.78 1.76 1.75s-.79 1.76-1.76 1.76m1.39 9.74v-8.37H5.07v8.37h2.78Z" />
              </svg>
              <span>LinkedIn</span>
            </button>
            <button
              type="button"
              className={`community-tab-btn tab-yt ${activeTab === 'youtube' ? 'active' : ''}`}
              onClick={() => setActiveTab('youtube')}
              role="tab"
              aria-selected={activeTab === 'youtube'}
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span>YouTube</span>
            </button>
          </div>
        </div>

        {/* 3-Column Social Media Feed Cards Grid */}
        <div className={`community-cards-grid ${activeTab !== 'all' ? 'single-tab-active' : ''}`}>

          {/* ========================================================
              CARD 1: INSTAGRAM GALLERY
              ======================================================== */}
          {(activeTab === 'all' || activeTab === 'instagram') && (
            <article className="social-feed-card card-instagram">
              {/* Instagram Banner Header */}
              <div className="social-card-banner ig-banner">
                <div className="banner-left">
                  <div className="social-brand-icon">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div>
                    <span className="banner-title">Instagram Gallery</span>
                    <span className="banner-handle">@thenam_software_solutions</span>
                  </div>
                </div>

                <a
                  href="https://www.instagram.com/thenam_software_solutions/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="banner-action-btn"
                  aria-label="Follow Thenam Software Solutions on Instagram"
                >
                  <span>Follow</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              {/* Profile Row: Real stats & Verified Handle */}
              <div className="social-profile-row">
                <div className="profile-avatar-wrap ring-instagram">
                  <img src="/thenam-logo.png" alt="Thenam Software Solutions" className="profile-avatar-img" />
                </div>
                <div className="profile-info-wrap">
                  <div className="profile-name-row">
                    <span className="profile-name">Thenam Software Solutions</span>
                    <CheckCircle2 size={14} className="verified-badge-blue" />
                  </div>
                  <p className="profile-tagline">@thenam_software_solutions · AI | Web | Cloud</p>
                  <div className="profile-stats-chips">
                    <span><strong>18</strong> Posts</span>
                    <span className="stat-dot">•</span>
                    <span><strong>59</strong> Followers</span>
                    <span className="stat-dot">•</span>
                    <span><strong>9</strong> Following</span>
                  </div>
                </div>
              </div>

              {/* Exact Real Bio & Leadership */}
              <div className="ig-compact-bio-bar">
                <div className="ig-compact-bio-text">
                  <span className="ig-lead-badge">Leadership</span>
                  <span>Harishwaran. P (CEO) · Jayamurugan V (Founder)</span>
                </div>
                <div className="ig-compact-bio-sub">
                  <span>🌐 AI | Web | Cloud · Porur, Chennai 600116</span>
                </div>
              </div>

              {/* Exact 3-Column Square Image Gallery */}
              <div className="ig-compact-gallery">
                {instagramPosts.map((post) => {
                  const isLiked = likedPosts[post.id]
                  return (
                    <a
                      key={post.id}
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ig-compact-tile group"
                      aria-label={post.title}
                      title={post.title}
                    >
                      <div className="ig-compact-img-wrap">
                        <img src={post.image} alt={post.title} className="ig-compact-img" />
                        <span className="ig-compact-badge">{post.badge}</span>

                        {/* Hover Overlay */}
                        <div className="ig-compact-overlay">
                          <span className="ig-compact-metric">
                            <Heart size={11} fill="#ffffff" />
                            {post.likes + (isLiked ? 1 : 0)}
                          </span>
                          <span className="ig-compact-metric">
                            <MessageCircle size={11} fill="#ffffff" />
                            {post.comments}
                          </span>
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>

              {/* Card Footer Link */}
              <div className="social-card-footer">
                <a
                  href="https://www.instagram.com/thenam_software_solutions/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-footer-cta"
                >
                  <span>Explore @thenam_software_solutions on Instagram</span>
                  <ArrowRight size={13} />
                </a>
              </div>
            </article>
          )}

          {/* ========================================================
              CARD 2: LINKEDIN UPDATES
              ======================================================== */}
          {(activeTab === 'all' || activeTab === 'linkedin') && (
            <article className="social-feed-card card-linkedin">
              {/* LinkedIn Banner Header */}
              <div className="social-card-banner li-banner">
                <div className="banner-left">
                  <div className="social-brand-icon">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75c.97 0 1.76.78 1.76 1.75s-.79 1.76-1.76 1.76m1.39 9.74v-8.37H5.07v8.37h2.78Z" />
                    </svg>
                  </div>
                  <div>
                    <span className="banner-title">LinkedIn Updates</span>
                    <span className="banner-handle">Company / Thenam Software</span>
                  </div>
                </div>

                <a
                  href="https://www.linkedin.com/company/thenam-software-solutions/posts/?feedView=all"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="banner-action-btn"
                  aria-label="Follow Thenam Software Solutions on LinkedIn"
                >
                  <span>Follow Page</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Profile Bar */}
              <div className="social-profile-row">
                <div className="profile-avatar-wrap ring-linkedin">
                  <img src="/thenam-logo.png" alt="Thenam Software Solutions" className="profile-avatar-img" />
                </div>
                <div className="profile-info-wrap">
                  <div className="profile-name-row">
                    <span className="profile-name">Thenam Software Solutions</span>
                    <CheckCircle2 size={14} className="verified-badge-blue" />
                  </div>
                  <p className="profile-tagline">AI-First Software Studio · Chennai, Tamil Nadu</p>
                  <div className="profile-stats-chips">
                    <span><strong>190+</strong> Followers</span>
                    <span className="stat-dot">•</span>
                    <span>Information Technology & Services</span>
                  </div>
                </div>
              </div>

              {/* LinkedIn Posts Feed */}
              <div className="li-posts-stack">
                {(activeTab === 'all' ? linkedinUpdates.slice(0, 1) : linkedinUpdates).map((post) => {
                  const isLiked = likedPosts[post.id]
                  return (
                    <div key={post.id} className="li-post-card">
                      <div className="li-post-meta">
                        <div className="li-author-avatar">
                          <img src="/thenam-logo.png" alt="Author" />
                        </div>
                        <div>
                          <span className="li-author-name">Thenam Software Solutions</span>
                          <span className="li-timestamp">{post.date} · 🌐 Public</span>
                        </div>
                      </div>

                      <p className="li-post-text">{post.text}</p>

                      <div className="li-tags-row">
                        {post.tags.map((t) => (
                          <span key={t} className="li-tag">{t}</span>
                        ))}
                      </div>

                      {/* Engagement stats & actions */}
                      <div className="li-actions-bar">
                        <button
                          type="button"
                          className={`li-action-btn ${isLiked ? 'liked' : ''}`}
                          onClick={(e) => toggleLike(post.id, e)}
                        >
                          <ThumbsUp size={14} />
                          <span>{post.likes + (isLiked ? 1 : 0)} Like</span>
                        </button>
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="li-action-btn"
                        >
                          <MessageCircle size={14} />
                          <span>{post.comments} Comment</span>
                        </a>
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="li-action-btn"
                        >
                          <Repeat2 size={14} />
                          <span>{post.reposts} Repost</span>
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Card Footer Link */}
              <div className="social-card-footer">
                <a
                  href="https://www.linkedin.com/company/thenam-software-solutions/posts/?feedView=all"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-footer-cta"
                >
                  <span>Connect with us on LinkedIn</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </article>
          )}

          {/* ========================================================
              CARD 3: YOUTUBE CHANNEL
              ======================================================== */}
          {(activeTab === 'all' || activeTab === 'youtube') && (
            <article className="social-feed-card card-youtube">
              {/* YouTube Banner Header */}
              <div className="social-card-banner yt-banner">
                <div className="banner-left">
                  <div className="social-brand-icon">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <div>
                    <span className="banner-title">YouTube Channel</span>
                    <span className="banner-handle">@Thenamsoftwaresolutions-v9w</span>
                  </div>
                </div>

                <a
                  href="https://www.youtube.com/@Thenamsoftwaresolutions-v9w"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="banner-action-btn yt-btn"
                  aria-label="Subscribe to Thenam Software Solutions on YouTube"
                >
                  <span>Subscribe</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Profile Bar */}
              <div className="social-profile-row">
                <div className="profile-avatar-wrap ring-youtube">
                  <img src="/thenam-logo.png" alt="Thenam Software Solutions" className="profile-avatar-img" />
                </div>
                <div className="profile-info-wrap">
                  <div className="profile-name-row">
                    <span className="profile-name">Thenam Software Solutions</span>
                    <CheckCircle2 size={14} className="verified-badge-blue" />
                  </div>
                  <p className="profile-tagline">AI Software Studio & Engineering Demonstrations</p>
                  <div className="profile-stats-chips">
                    <span><strong>@Thenamsoftwaresolutions-v9w</strong></span>
                    <span className="stat-dot">•</span>
                    <span><strong>120+</strong> Subscribers</span>
                  </div>
                </div>
              </div>

              {/* YouTube Video List */}
              <div className="yt-videos-stack">
                {(activeTab === 'all' ? youtubeVideos.slice(0, 1) : youtubeVideos).map((video) => (
                  <a
                    key={video.id}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="yt-video-card group"
                    aria-label={video.title}
                  >
                    <div className="yt-thumb-wrap">
                      <img src={video.thumb} alt={video.title} className="yt-thumb-img" />
                      <div className="yt-play-chip">
                        <Play size={14} fill="white" />
                      </div>
                      <span className="yt-duration-pill">{video.duration}</span>
                      <span className="yt-quality-badge">{video.badge}</span>
                    </div>

                    <div className="yt-video-info">
                      <span className="yt-video-category">{video.category}</span>
                      <h4 className="yt-video-title">{video.title}</h4>
                      <div className="yt-video-stats">
                        <Eye size={12} />
                        <span>{video.views}</span>
                        <span className="stat-dot">•</span>
                        <span>{video.time}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Card Footer Link */}
              <div className="social-card-footer">
                <a
                  href="https://www.youtube.com/@Thenamsoftwaresolutions-v9w"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-footer-cta"
                >
                  <span>Watch all demos on YouTube</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  )
}
