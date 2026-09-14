import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <section
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          color: "white",
          background: "linear-gradient(135deg, #0F5C4A, #16211E 65%, #7B5B3E)"
        }}
      >
        <p style={{ fontSize: 28, letterSpacing: 8, textTransform: "uppercase", opacity: 0.72 }}>
          Du lich cong dong tai Hue
        </p>
        <h1 style={{ margin: "26px 0 0", fontSize: 104, lineHeight: 1, fontWeight: 800 }}>
          Cham A Luoi
        </h1>
        <p style={{ marginTop: 34, maxWidth: 820, fontSize: 34, lineHeight: 1.35, opacity: 0.8 }}>
          Van hoa ban dia, homestay mien nui, san pham dia phuong va nhung chuyen di co y nghia.
        </p>
      </section>
    ),
    size
  );
}
