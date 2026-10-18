import React from 'react';
import { ArrowLeft, AtSign, ExternalLink, Send } from 'lucide-react';
import { AUTHOR } from '../data/author';

interface AuthorPageProps {
  onBack: () => void;
}

export const AuthorPage: React.FC<AuthorPageProps> = ({ onBack }) => {
  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <button
        onClick={onBack}
        className="btn-classic-secondary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.75rem' }}
      >
        <ArrowLeft size={15} /> Trở về Tòa Soạn
      </button>

      {/* Masthead */}
      <header style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.72rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--accent-primary)',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          Về Tác Giả
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif-display)',
            fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: '0 0 0.5rem',
            color: 'var(--text-primary)',
          }}
        >
          {AUTHOR.penName}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-serif-heading)',
            fontStyle: 'italic',
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            margin: 0,
          }}
        >
          {AUTHOR.tagline}
        </p>
      </header>

      <div className="newspaper-masthead-rule" style={{ margin: '1.25rem 0 1.75rem' }} />

      {/* Metadata strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.5rem 1.5rem',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          marginBottom: '2.5rem',
        }}
      >
        <span>
          Tên thật: <strong style={{ color: 'var(--text-primary)' }}>{AUTHOR.realName}</strong>
        </span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span>
          Sinh năm <strong style={{ color: 'var(--text-primary)' }}>{AUTHOR.birthYear}</strong>
        </span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span>
          Quê: <strong style={{ color: 'var(--text-primary)' }}>{AUTHOR.hometown}</strong>
        </span>
        <span style={{ opacity: 0.4 }}>•</span>
        <a
          href={AUTHOR.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}
        >
          {AUTHOR.handle}
        </a>
      </div>

      {/* Lead + portrait column */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: '2.5rem',
          maxWidth: '760px',
          margin: '0 auto',
        }}
      >
        <div className="article-body">
          <p style={{ fontSize: '1.22rem', lineHeight: 1.85, color: 'var(--text-primary)' }}>{AUTHOR.lead}</p>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1px',
              backgroundColor: 'var(--border-subtle)',
              border: '1px solid var(--border-subtle)',
              margin: '2.25rem 0',
            }}
          >
            {AUTHOR.stats.map((s) => (
              <div key={s.label} style={{ backgroundColor: 'var(--bg-card)', padding: '1.1rem 1rem', textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-serif-display)',
                    fontSize: '1.7rem',
                    lineHeight: 1.1,
                    color: 'var(--accent-primary)',
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginTop: '0.35rem',
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {AUTHOR.sections.map((sec) => (
            <section key={sec.heading}>
              <h2
                style={{
                  fontFamily: 'var(--font-serif-display)',
                  fontSize: '1.6rem',
                  marginTop: '2.5rem',
                  marginBottom: '0.9rem',
                  color: 'var(--text-primary)',
                }}
              >
                {sec.heading}
              </h2>
              {sec.paragraphs.map((p, i) => (
                <p key={i} style={{ marginBottom: '1.1rem' }}>
                  {p}
                </p>
              ))}
            </section>
          ))}

          {/* Pull quote */}
          <blockquote
            style={{
              borderLeft: '3px solid var(--accent-primary)',
              margin: '2.75rem 0',
              padding: '0.25rem 0 0.25rem 1.5rem',
              fontFamily: 'var(--font-serif-heading)',
              fontStyle: 'italic',
              fontSize: '1.45rem',
              lineHeight: 1.55,
              color: 'var(--text-primary)',
            }}
          >
            “{AUTHOR.quote}”
            <footer
              style={{
                fontFamily: 'var(--font-sans)',
                fontStyle: 'normal',
                fontSize: '0.78rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginTop: '0.85rem',
              }}
            >
              — {AUTHOR.quoteSource}
            </footer>
          </blockquote>

          {/* Timeline */}
          <h2
            style={{
              fontFamily: 'var(--font-serif-display)',
              fontSize: '1.6rem',
              marginTop: '3rem',
              marginBottom: '1.5rem',
              color: 'var(--text-primary)',
            }}
          >
            Dòng thời gian
          </h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {AUTHOR.milestones.map((m) => (
              <li
                key={m.year + m.title}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '5.5rem minmax(0, 1fr)',
                  gap: '1rem',
                  padding: '0.9rem 0',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono, var(--font-sans))',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                    paddingTop: '0.15rem',
                  }}
                >
                  {m.year}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-serif-heading)',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '0.2rem',
                    }}
                  >
                    {m.title}
                  </div>
                  <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{m.text}</div>
                </div>
              </li>
            ))}
          </ol>

          {/* CTA */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '3px double var(--border-strong, var(--border-subtle))',
            }}
          >
            <a
              href={AUTHOR.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-classic-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none' }}
            >
              <AtSign size={15} /> Theo dõi trên X
            </a>
            <a
              href={AUTHOR.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-classic-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none' }}
            >
              <Send size={15} /> Kênh Telegram
            </a>
            <button
              onClick={onBack}
              className="btn-classic-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <ExternalLink size={15} /> Đọc bài viết
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
