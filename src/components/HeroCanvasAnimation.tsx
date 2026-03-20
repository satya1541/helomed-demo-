'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import './HeroCanvasAnimation.css';

const TOTAL_FRAMES = 240;
const FRAME_PATH = '/frames';
const FRAME_PREFIX = 'ezgif-frame-';
const FRAME_EXT = 'jpg';

const getFrameSrc = (index: number) => {
    const frameNumber = String(index + 1).padStart(3, '0');
    return `${FRAME_PATH}/${FRAME_PREFIX}${frameNumber}.${FRAME_EXT}`;
};

export default function HeroCanvasAnimation() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const navigate = useNavigate();

    // Scroll progress tracking based on container position
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start']
    });

    // Remap so all frames show within the sticky scroll area (container height - viewport height)
    // with 400vh height, sticky area is 300vh. Scroll range 0 to 1.
    // Sticky ends at 0.75. User wants 95% mapping of total height.
    const adjustedProgress = useTransform(scrollYProgress, [0, 0.95], [0, 1]);

    // Smooth spring animation for buttery scroll
    const smoothProgress = useSpring(adjustedProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Map scroll to frame index (bi-directional)
    const frameIndex = useTransform(
        smoothProgress,
        [0, 1],
        [0, TOTAL_FRAMES - 1]
    );

    // Preload all frames progressively
    useEffect(() => {
        // Skip loading on mobile devices
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            return;
        }

        const loadFrame = (index: number): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = getFrameSrc(index);
                img.onload = () => resolve(img);
                img.onerror = () => {
                    console.warn(`Failed to load frame ${index}`);
                    reject(new Error(`Frame ${index} failed`));
                };
            });
        };

        const loadProgressive = async () => {
            const allImages: HTMLImageElement[] = new Array(TOTAL_FRAMES);

            // 1. Load the first frame ASAP
            try {
                const firstImg = await loadFrame(0);
                allImages[0] = firstImg;
                setImages([...allImages]);
                setImagesLoaded(true); // Show the first frame immediately
            } catch (err) {
                console.error("First frame failed to load", err);
            }

            // 2. Load the rest in chunks to avoid blocking
            const CHUNK_SIZE = 20;
            for (let i = 1; i < TOTAL_FRAMES; i += CHUNK_SIZE) {
                const chunkPromises = [];
                for (let j = i; j < Math.min(i + CHUNK_SIZE, TOTAL_FRAMES); j++) {
                    chunkPromises.push(
                        loadFrame(j).then(img => {
                            allImages[j] = img;
                            return img;
                        }).catch(() => null)
                    );
                }

                await Promise.all(chunkPromises);
                // Update state after each chunk
                setImages([...allImages]);
            }
        };

        loadProgressive();
    }, []);

    // Canvas rendering
    useEffect(() => {
        if (!imagesLoaded || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId = 0;
        let lastFrame = -1;

        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const width = window.innerWidth;
            const height = window.innerHeight;

            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
        };

        resizeCanvas();

        const renderFrame = (frame: number) => {
            const targetIndex = Math.max(0, Math.min(frame, TOTAL_FRAMES - 1));
            // Find the nearest available frame if the target isn't loaded yet
            let img = images[targetIndex];

            if (!img) {
                // Search backwards for the nearest loaded frame
                for (let i = targetIndex - 1; i >= 0; i--) {
                    if (images[i]) {
                        img = images[i];
                        break;
                    }
                }
            }

            if (!img) return;

            const width = window.innerWidth;
            const height = window.innerHeight;
            const isPortrait = height > width;

            let scale: number;
            if (isPortrait) {
                // Fill width first
                scale = width / img.width;
                // Ensure image fills at least 90% of screen height for a nice zoom
                const minScale = (height * 0.9) / img.height;
                scale = Math.max(scale, minScale);
            } else {
                // Desktop/landscape: cover fit
                scale = Math.max(width / img.width, height / img.height);
            }

            const scaledW = img.width * scale;
            const scaledH = img.height * scale;
            const x = (width - scaledW) / 2;
            const y = (height - scaledH) / 2;

            // Clear and draw
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, x, y, scaledW, scaledH);
        };

        const loop = () => {
            // Stop loop if on mobile or images not loaded
            if (window.innerWidth < 768 || !imagesLoaded) {
                // But keep checking resize? No need to animate if hidden.
                // Actually this loop is driven by requestAnimationFrame.
                // A resize might bring it back. Let's just return if < 768.
                if (window.innerWidth >= 768) {
                    animationFrameId = window.requestAnimationFrame(loop);
                }
                return;
            }

            const currentFrame = Math.round(frameIndex.get());
            if (currentFrame !== lastFrame) {
                lastFrame = currentFrame;
                renderFrame(currentFrame);
            }
            animationFrameId = window.requestAnimationFrame(loop);
        };

        renderFrame(Math.round(frameIndex.get()));
        animationFrameId = window.requestAnimationFrame(loop);

        // Handle window resize
        const handleResize = () => {
            resizeCanvas();
            renderFrame(Math.round(frameIndex.get()));
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, [imagesLoaded, images, frameIndex]);

    // Text overlay animations - adjusted for longer visibility
    // S1: 0-0.22 (Stay ~0.13)
    const section1Opacity = useTransform(smoothProgress, [0, 0.05, 0.18, 0.22], [0, 1, 1, 0]);
    // S2: 0.24-0.48 (Stay ~0.15)
    const section2Opacity = useTransform(smoothProgress, [0.24, 0.29, 0.44, 0.48], [0, 1, 1, 0]);
    // S3: 0.50-0.74 (Stay ~0.15)
    const section3Opacity = useTransform(smoothProgress, [0.50, 0.55, 0.70, 0.74], [0, 1, 1, 0]);
    // S4: 0.76-1.0 (Stay until end)
    const section4Opacity = useTransform(smoothProgress, [0.76, 0.81, 0.95, 1], [0, 1, 1, 0]);



    return (
        <div ref={containerRef} className="hero-canvas-container">
            <div className="hero-canvas-sticky">
                <motion.div
                    className="canvas-wrapper"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: imagesLoaded ? 1 : 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <canvas
                        ref={canvasRef}
                        className="hero-canvas"
                    />
                </motion.div>

                {/* Text Overlays */}
                <div className="overlay-container">
                    {/* Section 1: Intro */}
                    <motion.div
                        style={{ opacity: section1Opacity }}
                        className="overlay-section start"
                    >
                        <div className="overlay-content">
                            <h1 className="text-title">
                                Premium Wellness Solutions
                            </h1>
                            <p className="text-subtitle">
                                Access pharmaceutical care, wellness products, and expert medical advice—all from the comfort of your space.
                            </p>
                        </div>
                    </motion.div>

                    {/* Section 2: Fast Delivery */}
                    <motion.div
                        style={{ opacity: section2Opacity }}
                        className="overlay-section start"
                    >
                        <div className="overlay-content">
                            <h2 className="text-title">
                                Fast Delivery
                            </h2>
                            <p className="text-subtitle">
                                Get your medicines and health products delivered to your doorstep with our rapid logistics network.
                            </p>
                        </div>
                    </motion.div>

                    {/* Section 3: Genuine Products */}
                    <motion.div
                        style={{ opacity: section3Opacity }}
                        className="overlay-section end"
                    >
                        <div className="overlay-content" style={{ textAlign: 'right' }}>
                            <h2 className="text-title">
                                100% Genuine
                            </h2>
                            <p className="text-subtitle">
                                Authentic products sourced directly from manufacturers. Quality you can trust.
                            </p>
                        </div>
                    </motion.div>

                    {/* Section 4: Call to Action */}
                    <motion.div
                        style={{ opacity: section4Opacity }}
                        className="overlay-section center"
                    >
                        <div className="overlay-content center">
                            <h2 className="text-title">
                                Designed for your health.
                            </h2>
                            <div className="button-group">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/medicines')}
                                    className="btn-hero-primary"
                                >
                                    Shop Collections
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/about')}
                                    className="btn-hero-secondary"
                                >
                                    How it works
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>


            </div>
        </div>
    );
}
