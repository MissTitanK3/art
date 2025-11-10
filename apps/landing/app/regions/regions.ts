export type Region = {
  name: string;
  subdomain: string; // e.g., "demo", "pnw"
  coverage: string; // human-readable coverage area
  notes?: string;
  disabled?: boolean; // if true, link is shown but marked as coming soon
  signals?: Array<{ name: string; url: string }>; // optional Signal group invite links
};

export const REGIONS: Region[] = [
  // Deployed
  {
    name: "Demo Region",
    subdomain: "demo",
    coverage: "US-wide demo environment",
    notes: "Demo-only; not connected to a live database.",
    signals: [
      {
        name: "ART: Region Setup Chat",
        url: "https://signal.group/#CjQKIADTv-8bQiCFQ9uNpqdZVe8ngPlj8O4XSd1hnMBhdg-lEhAKlOr9EvjsnlQh9RXActF-",
      },
    ],
  },
  {
    name: "Pacific Northwest",
    subdomain: "pnw",
    coverage: "Washington, Oregon, Idaho panhandle",
    notes: "Existing Olympia hub. Seattle, Tacoma, Portland next anchors.",
    signals: [
      {
        name: "PNW Region Signal Group",
        url: "https://signal.group/#CjQKIC4jrO0uh1BSRFFRmu2Z-VZgxR2XtXjMYmMNrFjORhPdEhBHmKTuxZXPrOIq3W4jp1Qg",
      },
    ],
  },
  {
    name: "We Are Pierce",
    subdomain: "wap",
    coverage: "Pierce County, Washington",
    notes: "Local mutual-aid and disaster response network centered on Tacoma.",
    signals: [
      {
        name: "We Are Pierce Signal Group",
        url: "https://signal.group/#CjQKIC4jrO0uh1BSRFFRmu2Z-VZgxR2XtXjMYmMNrFjORhPdEhBHmKTuxZXPrOIq3W4jp1Qg",
      },
    ],
  },
  {
    name: "Northern California",
    subdomain: "norcal",
    coverage: "Bay Area, Sacramento, Humboldt",
    notes: "Distinct tech+activist density. Split from SoCal for autonomy.",
    signals: [
      {
        name: "NorCal Region Signal Group",
        url: "https://signal.group/#CjQKIEjsWC2x26LBsjL69vnkH0IEbYetnVH8OQkYeeYo7nuyEhDRAeLVCc4hQHbGHF2N7sPR",
      },
    ],
  },

  // Planned / coming soon
  {
    name: "Southern California",
    subdomain: "socal",
    coverage: "LA, San Diego, Inland Empire",
    notes: "High volunteer density. Will eventually split LA vs SD.",
    signals: [
      {
        name: "SoCal Region Signal Group",
        url: "https://signal.group/#CjQKIB_HL6NbhnAhGQoUV5cKLA0vUbb2jezzyUYB7biIbOAaEhAWNkXxEyM2DiGxykZKyEem",
      },
    ],
  },
  {
    name: "Desert Southwest",
    subdomain: "desertsouthwest",
    coverage: "Arizona, New Mexico, southern Nevada",
    notes: "Border support, migrant aid, desert survival focus.",
    disabled: true,
    signals: [
      {
        name: "Desert Southwest Signal Group",
        url: "https://signal.group/#CjQKIMzrWKVvoFOsAmuJEKbkg5-h6ful5ZDcx4ZFJLOmvu8vEhDZ8gxCUtSsohw5hOZ41cn9",
      },
    ],
  },
  {
    name: "Rocky Mountains",
    subdomain: "rockies",
    coverage: "Montana, Wyoming, Idaho (except panhandle), western Colorado",
    notes: "Sparse population, disaster logistics corridor.",
    disabled: true,
    signals: [
      {
        name: "Rocky Mountains Signal Group",
        url: "https://signal.group/#CjQKIMzrWKVvoFOsAmuJEKbkg5-h6ful5ZDcx4ZFJLOmvu8vEhDZ8gxCUtSsohw5hOZ41cn9",
      },
    ],
  },
  {
    name: "Intermountain West",
    subdomain: "intermountain",
    coverage: "Utah, Nevada, western CO",
    notes: "Backup network for mountain regions. Useful redundancy with #5.",
    disabled: true,
    signals: [
      {
        name: "Intermountain West Signal Group",
        url: "https://signal.group/#CjQKIMzrWKVvoFOsAmuJEKbkg5-h6ful5ZDcx4ZFJLOmvu8vEhDZ8gxCUtSsohw5hOZ41cn9",
      },
    ],
  },
  {
    name: "Great Basin & Sierra",
    subdomain: "greatbasin",
    coverage: "Eastern CA, NV high desert, western UT",
    notes: "Optional merge with Intermountain if small.",
    disabled: true,
    signals: [
      {
        name: "Great Basin Signal Group",
        url: "https://signal.group/#CjQKIDsRtmnpX1PJOX2Yu7f97neJCSHYf2jfutcYT0p8GFQIEhA7ZgyrotE0MxWqn-JFboFg",
      },
    ],
  },
  {
    name: "Texas",
    subdomain: "texas",
    coverage:
      "Statewide, focus on major metros (Houston, Austin, Dallas, El Paso)",
    notes: "Large enough to become multiple regional pods later.",
    disabled: true,
    signals: [
      {
        name: "Texas Region Signal Group",
        url: "https://signal.group/#CjQKIHdDkj45jM5hh7wIC73Hn-BtD3A0QtYr6bphLURm-fNnEhCjHD38s6VkvB4-0_dyS5V3",
      },
    ],
  },
  {
    name: "Gulf Coast",
    subdomain: "gulfcoast",
    coverage: "TX coast, LA, MS, AL, FL Panhandle",
    notes: "Hurricane and disaster response hub.",
    disabled: true,
    signals: [
      {
        name: "Gulf Coast Signal Group",
        url: "https://signal.group/#CjQKIKzoXoLh_KFPXCCSufBuHxvO2M0ct1vIFBnWkfcjI8U1EhAZgsKoQJHjIg9dfjt5feVc",
      },
    ],
  },
  {
    name: "Mid-South",
    subdomain: "midsouth",
    coverage: "Tennessee, Kentucky, Arkansas, northern Mississippi",
    notes: "Bridges Deep South and Appalachia.",
    disabled: true,
    signals: [
      {
        name: "Mid-South Signal Group",
        url: "https://signal.group/#CjQKIN3iMDi9Uo2alavX2KH5spsnv9SY86Q3bscVY_1kXWmEEhDiPEXdTx5IF7VTHHwBGPQ1",
      },
    ],
  },
  {
    name: "Appalachia",
    subdomain: "appalachia",
    coverage: "Western NC, eastern KY, WV, TN highlands",
    notes: "Rural safety and mutual-aid specialization.",
    disabled: true,
    signals: [
      {
        name: "Appalachia Signal Group",
        url: "https://signal.group/#CjQKIGJI1AO0FHMGuKuV21MUt_PXQFu-pPPmagbhskmO1k4rEhAVUdBXYO1L_bv01SuWxdF-",
      },
    ],
  },
  {
    name: "Southeast",
    subdomain: "southeast",
    coverage: "Georgia, Florida, Carolinas",
    notes: "Major outreach and coastal relief corridor.",
    disabled: true,
    signals: [
      {
        name: "Southeast Signal Group",
        url: "https://signal.group/#CjQKIPB2f6Bm3LXGvWb2D5mjFudydD0qBTHr1ytsRxyjAtSGEhAAG_6DkYtQpQWTqk0TWOvL",
      },
    ],
  },
  {
    name: "Deep South",
    subdomain: "deepsouth",
    coverage: "Alabama, Mississippi, Louisiana inland",
    notes: "Distinct from Gulf for inland resilience ops.",
    disabled: true,
    signals: [
      {
        name: "Deep South Signal Group",
        url: "https://signal.group/#CjQKIGHAE3hfHNglm3W1p2o1z43SrAXZf79r6bP7uJu3r1OqEhDHVK5Hw9e7tXP4KumMnUyJ",
      },
    ],
  },
  {
    name: "Central Plains",
    subdomain: "centralplains",
    coverage: "Kansas, Nebraska, Oklahoma",
    notes: "Tornado alley coordination and supply routing.",
    disabled: true,
    signals: [
      {
        name: "Central Plains Signal Group",
        url: "https://signal.group/#CjQKIOqx0eyZimkmmoJgkqa9w5TQWm7cX86tHldKvGNT3VGjEhDBk5MJ1mVFs2TUEr-hMBrX",
      },
    ],
  },
  {
    name: "Northern Plains",
    subdomain: "northernplains",
    coverage: "North Dakota, South Dakota, rural MN",
    notes: "Low-density network, ties into Great Lakes.",
    disabled: true,
    signals: [
      {
        name: "Northern Plains Signal Group",
        url: "https://signal.group/#CjQKIPjdckD3ZC3YjuvfjmhEpbLTQHPXIoSrk8ALLFRqRTlPEhBuVajha1mCl7oeM9O4G5-n",
      },
    ],
  },
  {
    name: "Great Lakes",
    subdomain: "greatlakes",
    coverage: "MN, WI, IL, IN, MI, OH",
    notes: "Major logistics and industrial corridor. Likely 2+ sub-pods later.",
    disabled: true,
    signals: [
      {
        name: "Great Lakes Signal Group",
        url: "https://signal.group/#CjQKIJFmSCB_vP_HHUA0mepcta9s-cNT9fIOniWUGBRz2EJVEhARPiOjxFRwlgk4eRf0Vr-Q",
      },
    ],
  },
  {
    name: "Midwest Heartland",
    subdomain: "midwest",
    coverage: "MO, IA, southern IL",
    notes: "Overlaps with Central Plains. Good training/testing hub.",
    disabled: true,
    signals: [
      {
        name: "Midwest Heartland Signal Group",
        url: "https://signal.group/#CjQKILOedgCPFqVRi6BglhRd5Lb_stzBJ3xn4kGfI1mC8R2tEhBSR1DCoO1wGXv62Lil-RvU",
      },
    ],
  },
  {
    name: "Mid-Atlantic",
    subdomain: "midatlantic",
    coverage: "DC, MD, VA, DE, southern PA",
    notes: "Dense activist network, policy and legal focus.",
    disabled: true,
    signals: [
      {
        name: "Mid-Atlantic Signal Group",
        url: "https://signal.group/#CjQKILDMjsKfrpgsOQwYo0_8B9l3GINXSMfH7o5X3lSaMKemEhDZcjdnyGF3xb7uuYBA7y-G",
      },
    ],
  },
  {
    name: "Northeast Corridor",
    subdomain: "northeast",
    coverage: "NYC metro, NJ, eastern PA, southern NY",
    notes: "Media and digital ops hub.",
    disabled: true,
    signals: [
      {
        name: "Northeast Corridor Signal Group",
        url: "https://signal.group/#CjQKIMJ662lc5OC4KTq7YWUVRL4tvkc8sLN8V1W0xyYtRv9_EhA6rCn4NN_g99YpECUElAKp",
      },
    ],
  },
  {
    name: "New England",
    subdomain: "newengland",
    coverage: "MA, RI, CT, VT, NH, ME",
    notes: "Tight regional coordination. Winter logistics emphasis.",
    disabled: true,
    signals: [
      {
        name: "New England Signal Group",
        url: "https://signal.group/#CjQKICbkIw6q71BC0QDt-qoAmwAtfEpPZ9y7Hm0hd74wLsldEhCikw3y9ScheNmA8rwuh0n-",
      },
    ],
  },
  {
    name: "Great Lakes East",
    subdomain: "erie",
    coverage: "Buffalo, Erie, Cleveland corridor",
    notes: "Optional split from Great Lakes if density warrants.",
    disabled: true,
    signals: [
      {
        name: "Great Lakes East Signal Group",
        url: "https://signal.group/#CjQKIKr71DxdtMah6UsO9JdS1zp-jxYnAxUS6JYlRPIGPY1fEhCDR9RdpB79yvnNpITN_B8Q",
      },
    ],
  },
  {
    name: "Florida Peninsula",
    subdomain: "florida",
    coverage: "Entire state, excluding panhandle (in Gulf)",
    notes: "Disaster prep, community defense focus.",
    disabled: true,
    signals: [
      {
        name: "Florida Peninsula Signal Group",
        url: "https://signal.group/#CjQKIATbnglqrezNCESFIG_v2cqj-54TsqHKB05qrkLplEi2EhB2zMQHQbIxnLT9cxLdoqwD",
      },
    ],
  },
  {
    name: "Caribbean Territories",
    subdomain: "caribbean",
    coverage: "Puerto Rico, USVI, diaspora networks",
    notes: "Offshore logistics and translation support.",
    disabled: true,
    signals: [
      {
        name: "Caribbean Territories Signal Group",
        url: "https://signal.group/#CjQKIF9IAmxTw_-ovxycWlCeAvOfvorvRI84oSGHWwxgg7XpEhChhYUDOzGRYs-NgLlXtclq",
      },
    ],
  },
  {
    name: "Hawaii",
    subdomain: "hawaii",
    coverage: "Oʻahu, Maui, Big Island, Kauaʻi",
    notes: "Island autonomy model. Renewable energy and aid.",
    disabled: true,
    signals: [
      {
        name: "Hawaii Signal Group",
        url: "https://signal.group/#CjQKIMGiCtA6HjIQJ1eVynBlv9D7v8rPXG1MeAClp0MdFezgEhBBdZQV2whGzYxcQFAaDk3_",
      },
    ],
  },
  {
    name: "Alaska",
    subdomain: "alaska",
    coverage: "Anchorage, Fairbanks, Juneau",
    notes: "Rural and indigenous logistics model.",
    disabled: true,
    signals: [
      {
        name: "Alaska Signal Group",
        url: "https://signal.group/#CjQKINTcpH87rRcBYuEzO9dggTSG8OEcdB3GufAovxloUz_FEhAuDRvXTIkAeBTi0XRAK7pj",
      },
    ],
  },
];

export function regionUrl(subdomain: string, base = "alwaysreadytools.org") {
  return `https://${subdomain}.${base}`;
}
