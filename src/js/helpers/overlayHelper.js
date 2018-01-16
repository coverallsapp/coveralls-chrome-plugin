function fillColor(percentage) {
  if (percentage < 80) {
    return '#e05d44';
  } else if (percentage < 90) {
    return '#dfb317';
  } else if (percentage != null) {
    return '#97CA00';
  }

  return '#bbb';
}

function svgPercentageLabel(percentage) {
  if (percentage != null) {
    return `<text x="80" y="15" fill="#010101" fill-opacity=".3">${percentage}%</text>
            <text x="80" y="14">${percentage}%</text>`;
  }

  return `<circle cx="72" cy="10" r="3">
            <animate attributeName="r" from="3" to="3" begin="0s" dur="0.8s" values="3;1.75;3" calcMode="linear" repeatCount="indefinite"/>
            <animate attributeName="fill-opacity" from="1" to="1" begin="0s" dur="0.8s" values="1;.5;1" calcMode="linear" repeatCount="indefinite"/>
          </circle>
          <circle cx="80" cy="10" r="3" fill-opacity="0.3">
            <animate attributeName="r" from="1.75" to="1.75" begin="0s" dur="0.8s" values="1.75;3;1.75" calcMode="linear" repeatCount="indefinite"/>
            <animate attributeName="fill-opacity" from="0.5" to="0.5" begin="0s" dur="0.8s" values=".5;1;.5" calcMode="linear" repeatCount="indefinite"/>
          </circle>
          <circle cx="88" cy="10" r="3">
            <animate attributeName="r" from="3" to="3" begin="0s" dur="0.8s" values="3;1.75;3" calcMode="linear" repeatCount="indefinite"/>
            <animate attributeName="fill-opacity" from="1" to="1" begin="0s" dur="0.8s" values="1;.5;1" calcMode="linear" repeatCount="indefinite"/>
          </circle>`;
}

function svgBadge(percentage) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="99" height="20">
      <linearGradient id="a" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>
      <rect rx="3" width="99" height="20" fill="#555"/>
      <rect rx="3" x="63" width="36" height="20" fill="${fillColor(percentage)}"/>
      <path fill="${fillColor(percentage)}" d="M63 0h4v20h-4z"/>
      <rect rx="3" width="99" height="20" fill="url(#a)"/>
      <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
        <text x="32.5" y="15" fill="#010101" fill-opacity=".3">coverage</text>
        <text x="32.5" y="14">coverage</text>
        ${svgPercentageLabel(percentage)}
      </g>
    </svg>`;
}

export default {
  svgBadge,
};
