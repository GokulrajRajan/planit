import { describe, expect, it } from "vitest";
import { optimizedImage } from "./images";

describe("optimizedImage", () => {
  it("asks Cloudinary for an optimised, size-capped version", () => {
    expect(optimizedImage("https://res.cloudinary.com/planit/image/upload/v1764/planit/cover.jpg", 800)).toBe(
      "https://res.cloudinary.com/planit/image/upload/f_auto,q_auto,c_limit,w_800/v1764/planit/cover.jpg",
    );
  });

  it("leaves images hosted elsewhere unchanged", () => {
    expect(optimizedImage("https://example.com/photo.jpg", 800)).toBe("https://example.com/photo.jpg");
    expect(optimizedImage("/brand/planit-logo.png", 600)).toBe("/brand/planit-logo.png");
  });

  it("leaves Cloudinary videos and other delivery types unchanged", () => {
    const video = "https://res.cloudinary.com/planit/video/upload/v1/clip.mp4";
    expect(optimizedImage(video, 800)).toBe(video);
  });
});
