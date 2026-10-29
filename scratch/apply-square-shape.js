const fs = require('fs');

// 1. Update app/globals.css
let css = fs.readFileSync('app/globals.css', 'utf8');

// Replace .community-cards-grid
css = css.replace(
  /\.community-cards-grid\s*\{[\s\S]*?align-items:\s*stretch;\s*\}/,
  `.community-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: start;
  justify-items: center;
}

.community-cards-grid.single-tab-active {
  display: flex;
  justify-content: center;
}`
);

// Ensure .card-instagram has strict square aspect ratio and compact padding
const igSquareRules = `
.social-feed-card.card-instagram {
  aspect-ratio: 1 / 1;
  max-width: 380px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.social-feed-card.card-linkedin,
.social-feed-card.card-youtube {
  width: 100%;
  max-width: 380px;
  min-height: 380px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 auto;
}
`;

if (!css.includes('.social-feed-card.card-instagram {')) {
  css = css.replace('.card-instagram:hover {', igSquareRules + '\n.card-instagram:hover {');
}

// Adjust compact gallery padding and tile display
css = css.replace(
  /\.ig-compact-gallery\s*\{[\s\S]*?flex:\s*1;\s*\}/,
  `.ig-compact-gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 10px 14px;
  background: #081120;
}`
);

// Compact padding for banners and profile rows
css = css.replace(
  /\.social-card-banner\s*\{[\s\S]*?padding:\s*16px 20px;/,
  `.social-card-banner {
  padding: 10px 14px;`
);

css = css.replace(
  /\.social-profile-row\s*\{[\s\S]*?padding:\s*16px 20px;/,
  `.social-profile-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;`
);

fs.writeFileSync('app/globals.css', css, 'utf8');
console.log('Successfully updated app/globals.css');

// 2. Update components/CommunityFeeds.tsx
let comp = fs.readFileSync('components/CommunityFeeds.tsx', 'utf8');

// Update community-cards-grid className to support single-tab-active
comp = comp.replace(
  '<div className="community-cards-grid">',
  '<div className={`community-cards-grid ${activeTab !== \'all\' ? \'single-tab-active\' : \'\'}`}>\n'
);

// Update Instagram card to be a clean square box with 3 pure square tiles (no redundant duplicate captions)
const oldIgCardRegex = /<article className="social-feed-card card-instagram">[\s\S]*?<\/article>/;

const newIgCard = `<article className="social-feed-card card-instagram">
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
                    <CheckCircle2 size={13} className="verified-badge-blue" />
                    <span className="ig-mini-handle">@thenam_software_solutions</span>
                  </div>
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
                  <span>Explore @thenam_software_solutions</span>
                  <ArrowRight size={13} />
                </a>
              </div>
            </article>`;

comp = comp.replace(oldIgCardRegex, newIgCard);

// Limit LinkedIn and YouTube to 1 featured item in "All Feeds" view so all cards are squarish
comp = comp.replace(
  '{linkedinUpdates.map((post) => {',
  '{(activeTab === \'all\' ? linkedinUpdates.slice(0, 1) : linkedinUpdates).map((post) => {'
);

comp = comp.replace(
  '{youtubeVideos.map((video) => (',
  '{(activeTab === \'all\' ? youtubeVideos.slice(0, 1) : youtubeVideos).map((video) => ('
);

fs.writeFileSync('components/CommunityFeeds.tsx', comp, 'utf8');
console.log('Successfully updated components/CommunityFeeds.tsx');
