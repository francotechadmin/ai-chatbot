import type { UsageTrend } from './types';

// Helper function to generate chart path for SVG line charts
export function generateChartPath(data: UsageTrend[], key: 'queries' | 'captures'): string {
  if (!data || data.length === 0) return '';
  
  // Find the maximum value to normalize the data
  const maxValue = Math.max(...data.map(item => item[key]));
  
  // If all values are 0, return a flat line
  if (maxValue === 0) return 'M0,100 L100,100';
  
  // Generate the path
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    // Invert the y value (SVG y-axis is inverted)
    const y = 100 - ((item[key] / maxValue) * 100);
    return `${index === 0 ? 'M' : 'L'}${x},${y}`;
  });
  
  return points.join(' ');
}

// Helper function to generate donut chart slice
export function generateDonutSlice(startPercent: number, endPercent: number): string {
  // Convert percentages to angles
  const startAngle = (startPercent / 100) * 360;
  const endAngle = (endPercent / 100) * 360;
  
  // Convert angles to radians
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);
  
  // Calculate points on the circle
  const startX = 50 + 50 * Math.cos(startRad);
  const startY = 50 + 50 * Math.sin(startRad);
  const endX = 50 + 50 * Math.cos(endRad);
  const endY = 50 + 50 * Math.sin(endRad);
  
  // Determine which arc to use (large or small)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  
  // Create the SVG path for the slice
  if (endPercent - startPercent >= 100) {
    return 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
  }
  
  // Create a polygon path for CSS clip-path
  const points = [];
  points.push('50% 50%'); // Center point
  
  // Add the start point
  points.push(`${startX}% ${startY}%`);
  
  // Add points along the arc
  const steps = Math.max(2, Math.floor((endAngle - startAngle) / 10));
  for (let i = 1; i < steps; i++) {
    const angle = startAngle + ((endAngle - startAngle) * i) / steps;
    const rad = (angle - 90) * (Math.PI / 180);
    const x = 50 + 50 * Math.cos(rad);
    const y = 50 + 50 * Math.sin(rad);
    points.push(`${x}% ${y}%`);
  }
  
  // Add the end point
  points.push(`${endX}% ${endY}%`);
  points.push('50% 50%'); // Back to center
  
  return `polygon(${points.join(', ')})`;
}