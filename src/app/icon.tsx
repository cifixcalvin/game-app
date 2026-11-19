import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050706",
          border: "2px solid #b6ff2e",
          borderRadius: 12,
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            color: "#b6ff2e",
            fontFamily: "sans-serif",
            lineHeight: 1,
            transform: "skewX(-8deg)",
          }}
        >
          N
        </div>
      </div>
    ),
    size,
  );
}
