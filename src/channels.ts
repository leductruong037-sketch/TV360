export type Channel = {
  category: string;
  name: string;
  logo: string;
  stream: string;
  isVip?: boolean;
};

export const channels: Channel[] = [
  // VTV
  { 
    category: "VTV", 
    name: "VTV1 HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/VTV1_HD.png", 
    stream: "https://hd.xemtv.net/channels/vtv1-hd.html" 
  },
  { 
    category: "VTV", 
    name: "VTV2 HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/VTV2_HD.png", 
    stream: "https://hd.xemtv.net/channels/vtv2-hd.html" 
  },
  { 
    category: "VTV", 
    name: "VTV3 HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/VTV3_HD.png", 
    stream: "https://hd.xemtv.net/channels/vtv3-hd.html" 
  },
  { 
    category: "VTV", 
    name: "VTV4 HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/VTV4_HD.png", 
    stream: "https://hd.xemtv.net/channels/vtv4.html" 
  },
  { 
    category: "VTV", 
    name: "VTV5 HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/VTV5_HD.png", 
    stream: "https://hd.xemtv.net/channels/vtv5.html" 
  },
  { 
    category: "VTV", 
    name: "VTV Cần Thơ", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/VTV6_HD.png", 
    stream: "https://hd.xemtv.net/channels/vtv6-vtv-can-tho.html" 
  },
  { 
    category: "VTV", 
    name: "VTV7 HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/VTV7_HD.png", 
    stream: "https://hd.xemtv.net/channels/vtv7.html" 
  },
  { 
    category: "VTV", 
    name: "VTV8 HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/VTV8_HD.png", 
    stream: "https://hd.xemtv.net/channels/vtv8.html" 
  },
  { 
    category: "VTV", 
    name: "VTV9 HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/VTV9_HD.png", 
    stream: "https://hd.xemtv.net/channels/vtv9-hd.html" 
  },

  // HTV
  { 
    category: "HTV", 
    name: "HTV7 HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/HTV7_HD.png", 
    stream: "https://hd.xemtv.net/channels/htv7-hd.html" 
  },
  { 
    category: "HTV", 
    name: "HTV9 HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/HTV9_HD.png", 
    stream: "https://hd.xemtv.net/channels/htv9-hd.html" 
  },
  { 
    category: "HTV", 
    name: "HTV2 Vie Channel", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/HTV2_Vie_Channel.png", 
    stream: "https://hd.xemtv.net/channels/htv2-vie-channel.html" 
  },
  { 
    category: "HTV", 
    name: "HTV1", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/HTV1.png", 
    stream: "https://hd.xemtv.net/channels/htv1.html" 
  },
  { 
    category: "HTV", 
    name: "HTV3", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/HTV3.png", 
    stream: "https://hd.xemtv.net/channels/htv3.html" 
  },

  // VTVcab
  { 
    category: "VTVcab", 
    name: "Vie Giải Trí HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/VieGiaiTri_HD.png", 
    stream: "https://hd.xemtv.net/channels/vie-giai-tri.html",
    isVip: true
  },
  { 
    category: "VTVcab", 
    name: "Vie Dramas HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/VieDramas_HD.png", 
    stream: "https://hd.xemtv.net/channels/vie-dramas.html",
    isVip: true
  },
  { 
    category: "VTVcab", 
    name: "ON Football HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/OnFootball_HD.png", 
    stream: "https://hd.xemtv.net/channels/on-football.html",
    isVip: true
  },
  { 
    category: "VTVcab", 
    name: "ON Sports HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/OnSports_HD.png", 
    stream: "https://hd.xemtv.net/channels/on-sports.html",
    isVip: true
  },
  { 
    category: "VTVcab", 
    name: "BIBI HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/BIBI_HD.png", 
    stream: "https://hd.xemtv.net/channels/bibi.html",
    isVip: true
  },
  { 
    category: "VTVcab", 
    name: "Vie Phim HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/ViePhim_HD.png", 
    stream: "https://hd.xemtv.net/channels/vie-phim.html",
    isVip: true
  },

  // SCTV
  { 
    category: "SCTV", 
    name: "SCTV9 HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/SCTV9_HD.png", 
    stream: "https://hd.xemtv.net/channels/sctv9.html" 
  },
  { 
    category: "SCTV", 
    name: "SCTV14 HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/SCTV14_HD.png", 
    stream: "https://hd.xemtv.net/channels/sctv14.html" 
  },
  { 
    category: "SCTV", 
    name: "SCTV Plus", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/SCTV_Plus.png", 
    stream: "https://hd.xemtv.net/channels/sctv-plus.html" 
  },
  { 
    category: "SCTV", 
    name: "SCTV4", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/SCTV4.png", 
    stream: "https://hd.xemtv.net/channels/sctv4.html" 
  },

  // Kênh quốc tế
  {
    category: "Kênh quốc tế",
    name: "HBO HD",
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/HBO_HD.png",
    stream: "https://hd.xemtv.net/channels/hbo-hd.html",
    isVip: true
  },
  {
    category: "Kênh quốc tế",
    name: "AXN HD",
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/AXN_HD.png",
    stream: "https://hd.xemtv.net/channels/axn-hd.html",
    isVip: true
  },

  // Địa phương
  { 
    category: "Địa phương", 
    name: "THVL1 HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/THVL1_HD.png", 
    stream: "https://hd.xemtv.net/channels/thvl1-hd.html" 
  },
  { 
    category: "Địa phương", 
    name: "THVL2 HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/THVL2_HD.png", 
    stream: "https://hd.xemtv.net/channels/thvl2-hd.html" 
  },
  { 
    category: "Địa phương", 
    name: "Hà Nội 1 HD", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/Hanoi1_HD.png", 
    stream: "https://hd.xemtv.net/channels/hanoi-1-hd.html" 
  },
  { 
    category: "Địa phương", 
    name: "Đồng Nai 1", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/DongNai1.png", 
    stream: "https://hd.xemtv.net/channels/dong-nai-1.html" 
  },

  // Thiết yếu
  {
    category: "Thiết yếu",
    name: "QPVN HD",
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/QPVN_HD.png",
    stream: "https://hd.xemtv.net/channels/qpvn-hd.html"
  },
  {
    category: "Thiết yếu",
    name: "ANTV",
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/ANTV.png",
    stream: "https://hd.xemtv.net/channels/antv.html"
  },

  // Phát thanh
  { 
    category: "Phát thanh", 
    name: "Hà Nội FM", 
    logo: "https://static.tv360.vn/public/v1/images/channels/logo/Hanoi_FM.png", 
    stream: "https://hd.xemtv.net/channels/hannoifm.html" 
  }
];

