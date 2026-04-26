'use client';
import { useEffect, useRef } from 'react';
import ProfileCard from './ProfileCard/ProfileCard';
import BlurText from './BlurText/BlurText';

export default function OurTeam() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 40px',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Dekoratif background blur */}
      <div style={{
        position: 'absolute', top: '20%', left: '15%',
        width: '300px', height: '300px',
        background: 'rgba(6,182,212,0.06)',
        borderRadius: '50%', filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', top: '30%', right: '15%',
        width: '300px', height: '300px',
        background: 'rgba(139,92,246,0.06)',
        borderRadius: '50%', filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />

      {/* Header Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '70px',
        position: 'relative',
        zIndex: 5
      }}>
        {/* Tag kecil */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(6,182,212,0.08)',
          border: '1px solid rgba(6,182,212,0.2)',
          borderRadius: '100px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: '#06b6d4',
            animation: 'pulse 2s infinite'
          }} />
          <span style={{
            fontSize: '11px',
            letterSpacing: '3px',
            color: 'rgba(6,182,212,0.8)',
            textTransform: 'uppercase',
            fontFamily: 'monospace'
          }}>Kelompok 5 · RPL · UNESA 2024</span>
        </div>

        {/* Judul besar dengan efek BlurText */}
        <BlurText
          text="Our Team"
          delay={50}
          animateBy="letters"
          direction="top"
          className="gradient-text-spans"
          style={{
            fontSize: 'clamp(48px, 8vw, 80px)',
            fontWeight: '800',
            lineHeight: '1',
            margin: '0 0 16px 0',
            letterSpacing: '-2px',
            justifyContent: 'center'
          }}
        />

        {/* Subtitle */}
        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          fontFamily: 'monospace',
          margin: '0'
        }}>Tim Pengembang · Sistem Informasi Toko LEJ</p>

        {/* Garis dekoratif */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '24px'
        }}>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to right,transparent,rgba(6,182,212,0.5))' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(6,182,212,0.5)' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(139,92,246,0.5)' }} />
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to left,transparent,rgba(139,92,246,0.5))' }} />
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: 'flex',
        gap: '60px',
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 5
      }}>

        {/* ===== CARD RENDY ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Label atas */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            alignSelf: 'flex-start'
          }}>
            <span style={{
              fontSize: '10px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              color: 'rgba(6,182,212,0.6)',
              fontFamily: 'monospace'
            }}>Quality Assurance</span>
          </div>

          {/* Profile Card */}
          <ProfileCard
            name="Rendy Agus Dwi Satrio"
            title="Fullstack Developer"
            handle="satrio-cvly"
            status="Online"
            contactText="GitHub"
            avatarUrl="/team/rendy.png"
            innerGradient="linear-gradient(145deg,#06b6d41a 0%,#0f0f2d 100%)"
            behindGlowEnabled={true}
            behindGlowColor="rgba(6,182,212,0.45)"
            enableTilt={true}
            showUserInfo={false}
            fullImage={true}
            onContactClick={() => window.open('https://github.com/satrio-cvly', '_blank')}
          />

          {/* User Info Bar (Pindah ke luar agar tidak menutupi foto) */}
          <div className="pc-user-info" style={{
            width: '100%',
            maxWidth: '360px',
            borderRadius: '16px',
            marginTop: '24px',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div className="pc-user-details">
              <div className="pc-mini-avatar">
                <img src="https://avatars.githubusercontent.com/satrio-cvly" alt="mini" loading="lazy" />
              </div>
              <div className="pc-user-text">
                <div className="pc-handle">@satrio-cvly</div>
                <div className="pc-status">Online</div>
              </div>
            </div>
            <button className="pc-contact-btn" onClick={() => window.open('https://github.com/satrio-cvly', '_blank')} type="button">
              GitHub
            </button>
          </div>

        </div>

        {/* ===== CARD ANNAS ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Label atas */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            alignSelf: 'flex-start'
          }}>
            <span style={{
              fontSize: '10px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              color: 'rgba(139,92,246,0.6)',
              fontFamily: 'monospace'
            }}>web developer</span>
          </div>

          {/* Profile Card */}
          <ProfileCard
            name="Annas Ridho Sadila"
            title="QA Engineer"
            handle="idoooyyyy33"
            status="Online"
            contactText="GitHub"
            avatarUrl="/team/ido.png"
            innerGradient="linear-gradient(145deg,#8b5cf61a 0%,#0f0f2d 100%)"
            behindGlowEnabled={true}
            behindGlowColor="rgba(139,92,246,0.45)"
            enableTilt={true}
            showUserInfo={false}
            fullImage={true}
            onContactClick={() => window.open('https://github.com/idoooyyyy33', '_blank')}
          />

          {/* User Info Bar (Pindah ke luar agar tidak menutupi foto) */}
          <div className="pc-user-info" style={{
            width: '100%',
            maxWidth: '360px',
            borderRadius: '16px',
            marginTop: '24px',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div className="pc-user-details">
              <div className="pc-mini-avatar">
                <img src="https://avatars.githubusercontent.com/idoooyyyy33" alt="mini" loading="lazy" />
              </div>
              <div className="pc-user-text">
                <div className="pc-handle">@idoooyyyy33</div>
                <div className="pc-status">Online</div>
              </div>
            </div>
            <button className="pc-contact-btn" onClick={() => window.open('https://github.com/idoooyyyy33', '_blank')} type="button">
              GitHub
            </button>
          </div>

        </div>

      </div>

      {/* Footer section */}
      <div style={{
        marginTop: '60px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 5
      }}>
        <div style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.15)',
          fontFamily: 'monospace',
          letterSpacing: '3px'
        }}>
          TEKNIK INFORMATIKA · UNIVERSITAS NEGERI SURABAYA · 2024
        </div>
      </div>

    </div>
  );
}