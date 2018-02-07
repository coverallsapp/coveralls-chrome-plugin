function fillColor(percentage) {
  if (percentage == null) {
    return '#bbb';
  } else if (percentage < 80) {
    return '#e05d44';
  } else if (percentage < 90) {
    return '#dfb317';
  }

  return '#97CA00';
}

function svgLoading() {
  return `
    <svg viewBox="0,0,120,30">
      <circle cx="15" cy="15" r="12">
        <animate attributeName="r" 
                 from="15" to="15" 
                 begin="0s" dur="0.8s" 
                 values="15;9;15" 
                 calcMode="linear" 
                 repeatCount="indefinite"/>
        <animate attributeName="fill-opacity" 
                 from="1" to="1" 
                 begin="0s" dur="0.8s" 
                 values="1;.5;1" 
                 calcMode="linear" 
                 repeatCount="indefinite"/>
      </circle>
      <circle cx="60" cy="15" r="12" fill-opacity="0.3">
        <animate attributeName="r" 
                 from="9" to="9" 
                 begin="0s" dur="0.8s" 
                 values="9;15;9" 
                 calcMode="linear" 
                 repeatCount="indefinite"/>
        <animate attributeName="fill-opacity" 
                 from="0.5" to="0.5" 
                 begin="0s" dur="0.8s" 
                 values=".5;1;.5" 
                 calcMode="linear" 
                 repeatCount="indefinite"/>
      </circle>
      <circle cx="105" cy="15" r="12">
        <animate attributeName="r" 
                 from="15" to="15" 
                 begin="0s" dur="0.8s" 
                 values="15;9;15" 
                 calcMode="linear" 
                 repeatCount="indefinite"/>
        <animate attributeName="fill-opacity" 
                 from="1" to="1" 
                 begin="0s" dur="0.8s" 
                 values="1;.5;1" 
                 calcMode="linear" 
                 repeatCount="indefinite"/>
      </circle>
    </svg>`;
}

function svgPercentageLabel(percentage) {
  if (percentage !== undefined) {
    return `
      <text x="80" y="15" fill="#010101" fill-opacity=".3">${Math.round(percentage)}%</text>
      <text x="80" y="14">${Math.round(percentage)}%</text>`;
  }

  return `
    <svg height="5" x="30" y="7.5">
      ${svgLoading()}
    </svg>`;
}

function coverallsBadge(percentage) {
  return `
    <span class="coveralls coveralls-percent-badge">
      <svg height="20" viewBox="0,0,99,20">
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
      </svg>
    </span>`;
}

export default {
  coverallsBadge,
  svgLoading,
};
