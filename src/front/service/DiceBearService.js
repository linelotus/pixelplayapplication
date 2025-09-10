import { createAvatar } from "@dicebear/core";
import {
  pixelArt,
  bottts,
  identicon,
  shapes,
  adventurer,
  bigEars,
  croodles,
  personas,
  miniavs,
} from "@dicebear/collection";

const DiceBearService = {
  AVATAR_STYLES: {
    "pixel-art": {
      name: "Pixel Art",
      requiredLevel: 1,
      style: pixelArt,
      options: ["mood", "backgroundColor"],
    },
    bottts: {
      name: "Robots",
      requiredLevel: 5,
      style: bottts,
      options: ["backgroundColor", "primaryColor"],
    },
    identicon: {
      name: "Geometric",
      requiredLevel: 3,
      style: identicon,
      options: ["backgroundColor"],
    },
    shapes: {
      name: "Abstract",
      requiredLevel: 8,
      style: shapes,
      options: ["backgroundColor"],
    },
    adventurer: {
      name: "Adventurer",
      requiredLevel: 10,
      style: adventurer,
      options: ["backgroundColor"],
    },
    "big-ears": {
      name: "Big Ears",
      requiredLevel: 12,
      style: bigEars,
      options: ["backgroundColor"],
    },
    croodles: {
      name: "Croodles",
      requiredLevel: 15,
      style: croodles,
      options: ["backgroundColor"],
    },
    personas: {
      name: "Personas",
      requiredLevel: 18,
      style: personas,
      options: ["backgroundColor"],
    },
    miniavs: {
      name: "Mini Avatars",
      requiredLevel: 20,
      style: miniavs,
      options: ["backgroundColor"],
    },
  },

  COLOR_MAP: {
    red: "#ff0000",
    blue: "#0066ff",
    green: "#228b22",
    purple: "#6a0dad",
    orange: "#ff8c00",
    pink: "#ff69b4",
    yellow: "#ffff00",
    black: "#000000",
    transparent: "transparent",
  },

  generateAvatarSvg(seed, options = {}) {
    const {
      style = "pixel-art",
      backgroundColor = "blue",
      mood = "happy",
    } = options;

    try {
      const styleConfig = this.AVATAR_STYLES[style];
      if (!styleConfig) {
        throw new Error(`Style '${style}' not found`);
      }

      const bgColor = this.COLOR_MAP[backgroundColor] || backgroundColor;

      const avatarOptions = {
        seed: seed,
      };

      if (bgColor !== "transparent") {
        avatarOptions.backgroundColor = [bgColor];
      }

      if (style === "pixel-art" && mood) {
        avatarOptions.mood = [mood];
      }

      const avatar = createAvatar(styleConfig.style, avatarOptions);
      return avatar.toString();
    } catch (error) {
      console.error("Error generating avatar:", error);
      throw error;
    }
  },

  svgToDataUrl(svgString) {
    const encodedSvg = encodeURIComponent(svgString);
    return `data:image/svg+xml,${encodedSvg}`;
  },

  generateAvatarUrl(seed, options = {}) {
    try {
      const svgString = this.generateAvatarSvg(seed, options);
      return this.svgToDataUrl(svgString);
    } catch (error) {
      console.error("Error generating avatar URL:", error);
      return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="55" text-anchor="middle" font-size="30">❓</text></svg>';
    }
  },
};

export default DiceBearService;
