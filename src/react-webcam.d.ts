declare module 'react-webcam' {
    import * as React from 'react';

    export interface WebcamProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
        audio?: boolean;
        height?: number | string;
        width?: number | string;
        screenshotFormat?: string;
        videoConstraints?: MediaTrackConstraints;
        className?: string;
        audioConstraints?: MediaTrackConstraints;
        forceScreenshotSourceSize?: boolean;
        imageSmoothing?: boolean;
        mirrored?: boolean;
        minScreenshotHeight?: number;
        minScreenshotWidth?: number;
        onUserMedia?: (stream: MediaStream) => void;
        onUserMediaError?: (error: string | DOMException) => void;
        screenshotQuality?: number;
    }

    export default class Webcam extends React.Component<WebcamProps> {
        getScreenshot(screenshotDimensions?: { width: number; height: number }): string | null;
    }
}
