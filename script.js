document.addEventListener('DOMContentLoaded', () => {
    // 1. 프로필 정보 렌더링 (공통)
    document.getElementById('ui-name').textContent = profile.name;
    document.getElementById('ui-title').textContent = profile.title;
    
    const specialtiesContainer = document.getElementById('ui-specialties');
    profile.specialties.forEach(spec => {
        const li = document.createElement('li');
        li.textContent = spec;
        specialtiesContainer.appendChild(li);
    });

    // 2. 홈 화면 메인 소개
    document.getElementById('ui-main-title').textContent = profile.mainIntro.title;
    document.getElementById('ui-main-body').textContent = profile.mainIntro.body;

    // 3. 강사소개 화면 (나의 소개)
    const aboutBody = document.getElementById('ui-about-body');
    profile.aboutMe.paragraphs.forEach(text => {
        const p = document.createElement('p');
        p.textContent = text;
        aboutBody.appendChild(p);
    });

    const highlightsContainer = document.getElementById('ui-about-highlights');
    if (profile.aboutMe.highlights && profile.aboutMe.highlights.length > 0) {
        profile.aboutMe.highlights.forEach(hlt => {
            const span = document.createElement('span');
            span.className = 'highlight-badge';
            span.textContent = hlt;
            highlightsContainer.appendChild(span);
        });
    }

    // 4. 강사소개 화면 (주요 교육 분야)
    const eduAreasContainer = document.getElementById('ui-edu-areas');
    profile.educationAreas.forEach(area => {
        const div = document.createElement('div');
        div.className = 'edu-item';
        div.textContent = area;
        eduAreasContainer.appendChild(div);
    });

    // 5. 강사소개 화면 (자격 및 전문 역량)
    const certsContainer = document.getElementById('ui-certifications');
    if (profile.certifications && profile.certifications.length > 0) {
        profile.certifications.forEach(cert => {
            const certCard = document.createElement('div');
            certCard.className = 'cert-item';
            
            const iconSpan = document.createElement('span');
            iconSpan.className = 'cert-icon';
            iconSpan.textContent = '🏅'; // 배지 아이콘
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'cert-name';
            nameSpan.textContent = cert;
            
            certCard.appendChild(iconSpan);
            certCard.appendChild(nameSpan);
            certsContainer.appendChild(certCard);
        });
    }

    // ----------------------------------------------------
    // 라우팅 (화면 전환)
    // ----------------------------------------------------
    const homeView = document.getElementById('home-view');
    const aboutView = document.getElementById('about-view');

    document.getElementById('menu-about').addEventListener('click', () => {
        homeView.style.display = 'none';
        aboutView.style.display = 'block';
        window.scrollTo(0, 0);
    });

    document.getElementById('btn-back-home').addEventListener('click', () => {
        aboutView.style.display = 'none';
        homeView.style.display = 'block';
        window.scrollTo(0, 0);
    });

    // ----------------------------------------------------
    // 메인 외부 링크 메뉴 (네이버 블로그, 유튜브)
    // ----------------------------------------------------
    document.getElementById('menu-blog').addEventListener('click', () => {
        if (profile.naverBlogUrl) {
            window.open(profile.naverBlogUrl, '_blank', 'noopener,noreferrer');
        } else {
            alert('네이버 블로그 주소를 등록해 주세요.');
        }
    });

    document.getElementById('menu-youtube').addEventListener('click', () => {
        if (profile.youtubeUrl) {
            window.open(profile.youtubeUrl, '_blank', 'noopener,noreferrer');
        } else {
            alert('유튜브 채널 주소를 등록해 주세요.');
        }
    });

    // ----------------------------------------------------
    // 메인 연락 액션 (연락처 저장, 네이버톡톡)
    // ----------------------------------------------------
    document.getElementById('btn-save-contact').addEventListener('click', () => {
        const vcardData = 
`BEGIN:VCARD
VERSION:3.0
FN:${profile.name}
TITLE:${profile.title}
TEL;TYPE=CELL:${profile.phone}
EMAIL:${profile.email}
URL:${profile.website}
END:VCARD`;

        const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${profile.name}_연락처.vcf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    document.getElementById('btn-navertalk').addEventListener('click', () => {
        if (profile.naverTalkUrl) {
            window.open(profile.naverTalkUrl, '_blank', 'noopener,noreferrer');
        } else {
            alert("네이버톡톡 주소를 등록해 주세요.");
        }
    });

    // ----------------------------------------------------
    // 빠른 연락 미니 버튼 (전화, 문자, 이메일, 공유)
    // ----------------------------------------------------
    document.getElementById('link-tel').href = `tel:${profile.phone}`;
    document.getElementById('link-sms').href = `sms:${profile.phone}`;
    document.getElementById('link-email').href = `mailto:${profile.email}`;

    document.getElementById('btn-share').addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: `${profile.name} | ${profile.title}`,
                url: profile.website,
            }).catch(console.error);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(profile.website).then(() => {
                alert('강사소개 링크를 복사했습니다.');
            }).catch(err => {
                const textArea = document.createElement("textarea");
                textArea.value = profile.website;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("Copy");
                textArea.remove();
                alert('강사소개 링크를 복사했습니다.');
            });
        }
    });

    // ----------------------------------------------------
    // QR 모달 및 자동 생성 로직
    // ----------------------------------------------------
    const qrModal = document.getElementById('qr-modal');
    const modalQrTitle = document.getElementById('modal-qr-title');
    const modalQrDesc = document.getElementById('modal-qr-desc');
    const modalQrcodeContainer = document.getElementById('modal-qrcode');
    
    let currentQR = null;

    function showQRModal(title, desc, url) {
        modalQrTitle.textContent = title;
        modalQrDesc.textContent = desc;
        modalQrcodeContainer.innerHTML = ''; // clear previous QR

        if (typeof QRCode !== 'undefined' && url) {
            currentQR = new QRCode(modalQrcodeContainer, {
                text: url,
                width: 200,
                height: 200,
                colorDark : "#1F2937",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            qrModal.style.display = "block";
        } else {
            alert("QR 코드를 생성할 수 없습니다. 주소를 확인해주세요.");
        }
    }

    document.getElementById('btn-show-my-qr').addEventListener('click', () => {
        showQRModal(
            `${profile.name} 강사 디지털 명함`,
            "QR코드를 스캔하면 강사소개 페이지로 이동합니다.",
            profile.website
        );
    });

    document.getElementById('btn-show-talk-qr').addEventListener('click', () => {
        if (!profile.naverTalkUrl) {
            alert("네이버톡톡 주소를 등록해 주세요.");
            return;
        }
        showQRModal(
            "네이버톡톡 문의하기",
            "QR코드를 스캔하면 네이버톡톡 문의로 이동합니다.",
            profile.naverTalkUrl
        );
    });

    // 모달 닫기
    const closeBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            qrModal.style.display = "none";
        });
    });
    window.addEventListener('click', (event) => {
        if (event.target == qrModal) {
            qrModal.style.display = "none";
        }
    });

    // ----------------------------------------------------
    // Background Animation (Constellation)
    // ----------------------------------------------------
    const canvas = document.getElementById('constellation');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];

    function initCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        const numParticles = Math.floor((width * height) / 12000);
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 0.5;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                const maxDist = 120;
                if (dist < maxDist) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / maxDist})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', initCanvas);
    initCanvas();
    animate();
});
