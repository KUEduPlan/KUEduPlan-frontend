export const generateGroupColors = (groups: string[]) => {
  const groupColors: Record<string, string> = {};
  const existingColors = new Set<string>();

  groups.forEach((group) => {
    if (!groupColors[group]) {
      let color;
      do {
        const hue = Math.floor(Math.random() * 360);
        const saturation = 70;
        const lightness = 85;
        color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      } while (existingColors.has(color));

      groupColors[group] = color;
      existingColors.add(color);
    }
  });

  return groupColors;
};

const generateRandomPastelColor = (existingColors: string[]) => {
  let color;
  do {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70;
    const lightness = 85;
    color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  } while (existingColors.includes(color));
  return color;
};

export const getSemesterColors = (numYears: number) => {
  const colors = [
    "#DDFFF6",
    "#D6F1FF",
    "#CCC9FF",
    "#EFD3FF",
    "#FFB4CF",
    "#BAF8FD",
    "#FFD7AF",
    "#EAD1DC",
    "#C3CB6E",
  ];

  const existingColors = [...colors];
  for (let i = colors.length / 2; i < numYears; i++) {
    colors.push(generateRandomPastelColor(existingColors));
    colors.push(generateRandomPastelColor(existingColors));
  }

  return colors;
};
