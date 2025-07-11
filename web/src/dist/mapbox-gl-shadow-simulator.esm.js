/**
 * Copyright Ted Piotrowski 2024
 * Package: mapbox-gl-shadow-simulator
 * Version: 0.60.0
 * For licensing visit: https://shademap.app/about/
 */

function t(t, e, r) {
  var o = e[1],
    i = e[0],
    n = o - i;
  return t === o && r ? t : ((((t - i) % n) + n) % n) + i;
}
function e(t, e) {
  if (!1 === e) return t;
  var r = Math.pow(10, void 0 === e ? 6 : e);
  return Math.round(t * r) / r;
}
var r =
  Array.isArray ||
  function (t) {
    return "[object Array]" === Object.prototype.toString.call(t);
  };
function o(t, e, r) {
  ((this.x = r ? Math.round(t) : t), (this.y = r ? Math.round(e) : e));
}
var i =
  Math.trunc ||
  function (t) {
    return t > 0 ? Math.floor(t) : Math.ceil(t);
  };
function n(t, e, i) {
  return t instanceof o
    ? t
    : r(t)
      ? new o(t[0], t[1])
      : null == t
        ? t
        : "object" == typeof t && "x" in t && "y" in t
          ? new o(t.x, t.y)
          : new o(t, e, i);
}
function a(t, e) {
  if (t)
    for (var r = e ? [t, e] : t, o = 0, i = r.length; o < i; o++)
      this.extend(r[o]);
}
function s(t, e) {
  return !t || t instanceof a ? t : new a(t, e);
}
function u(t, e) {
  if (t)
    for (var r = e ? [t, e] : t, o = 0, i = r.length; o < i; o++)
      this.extend(r[o]);
}
function l(t, e) {
  return t instanceof u ? t : new u(t, e);
}
((o.prototype = {
  clone: function () {
    return new o(this.x, this.y);
  },
  add: function (t) {
    return this.clone()._add(n(t));
  },
  _add: function (t) {
    return ((this.x += t.x), (this.y += t.y), this);
  },
  subtract: function (t) {
    return this.clone()._subtract(n(t));
  },
  _subtract: function (t) {
    return ((this.x -= t.x), (this.y -= t.y), this);
  },
  divideBy: function (t) {
    return this.clone()._divideBy(t);
  },
  _divideBy: function (t) {
    return ((this.x /= t), (this.y /= t), this);
  },
  multiplyBy: function (t) {
    return this.clone()._multiplyBy(t);
  },
  _multiplyBy: function (t) {
    return ((this.x *= t), (this.y *= t), this);
  },
  scaleBy: function (t) {
    return new o(this.x * t.x, this.y * t.y);
  },
  unscaleBy: function (t) {
    return new o(this.x / t.x, this.y / t.y);
  },
  round: function () {
    return this.clone()._round();
  },
  _round: function () {
    return ((this.x = Math.round(this.x)), (this.y = Math.round(this.y)), this);
  },
  floor: function () {
    return this.clone()._floor();
  },
  _floor: function () {
    return ((this.x = Math.floor(this.x)), (this.y = Math.floor(this.y)), this);
  },
  ceil: function () {
    return this.clone()._ceil();
  },
  _ceil: function () {
    return ((this.x = Math.ceil(this.x)), (this.y = Math.ceil(this.y)), this);
  },
  trunc: function () {
    return this.clone()._trunc();
  },
  _trunc: function () {
    return ((this.x = i(this.x)), (this.y = i(this.y)), this);
  },
  distanceTo: function (t) {
    var e = (t = n(t)).x - this.x,
      r = t.y - this.y;
    return Math.sqrt(e * e + r * r);
  },
  equals: function (t) {
    return (t = n(t)).x === this.x && t.y === this.y;
  },
  contains: function (t) {
    return (
      (t = n(t)),
      Math.abs(t.x) <= Math.abs(this.x) && Math.abs(t.y) <= Math.abs(this.y)
    );
  },
  toString: function () {
    return "Point(" + e(this.x) + ", " + e(this.y) + ")";
  },
}),
  (a.prototype = {
    extend: function (t) {
      var e, r;
      if (!t) return this;
      if (t instanceof o || "number" == typeof t[0] || "x" in t) e = r = n(t);
      else if (((e = (t = s(t)).min), (r = t.max), !e || !r)) return this;
      return (
        this.min || this.max
          ? ((this.min.x = Math.min(e.x, this.min.x)),
            (this.max.x = Math.max(r.x, this.max.x)),
            (this.min.y = Math.min(e.y, this.min.y)),
            (this.max.y = Math.max(r.y, this.max.y)))
          : ((this.min = e.clone()), (this.max = r.clone())),
        this
      );
    },
    getCenter: function (t) {
      return n((this.min.x + this.max.x) / 2, (this.min.y + this.max.y) / 2, t);
    },
    getBottomLeft: function () {
      return n(this.min.x, this.max.y);
    },
    getTopRight: function () {
      return n(this.max.x, this.min.y);
    },
    getTopLeft: function () {
      return this.min;
    },
    getBottomRight: function () {
      return this.max;
    },
    getSize: function () {
      return this.max.subtract(this.min);
    },
    contains: function (t) {
      var e, r;
      return (
        (t = "number" == typeof t[0] || t instanceof o ? n(t) : s(t)) instanceof
        a
          ? ((e = t.min), (r = t.max))
          : (e = r = t),
        e.x >= this.min.x &&
          r.x <= this.max.x &&
          e.y >= this.min.y &&
          r.y <= this.max.y
      );
    },
    intersects: function (t) {
      t = s(t);
      var e = this.min,
        r = this.max,
        o = t.min,
        i = t.max,
        n = i.x >= e.x && o.x <= r.x,
        a = i.y >= e.y && o.y <= r.y;
      return n && a;
    },
    overlaps: function (t) {
      t = s(t);
      var e = this.min,
        r = this.max,
        o = t.min,
        i = t.max,
        n = i.x > e.x && o.x < r.x,
        a = i.y > e.y && o.y < r.y;
      return n && a;
    },
    isValid: function () {
      return !(!this.min || !this.max);
    },
    pad: function (t) {
      var e = this.min,
        r = this.max,
        o = Math.abs(e.x - r.x) * t,
        i = Math.abs(e.y - r.y) * t;
      return s(n(e.x - o, e.y - i), n(r.x + o, r.y + i));
    },
    equals: function (t) {
      return (
        !!t &&
        ((t = s(t)),
        this.min.equals(t.getTopLeft()) && this.max.equals(t.getBottomRight()))
      );
    },
  }),
  (u.prototype = {
    extend: function (t) {
      var e,
        r,
        o = this._southWest,
        i = this._northEast;
      if (t instanceof c) ((e = t), (r = t));
      else {
        if (!(t instanceof u)) return t ? this.extend(f(t) || l(t)) : this;
        if (((e = t._southWest), (r = t._northEast), !e || !r)) return this;
      }
      return (
        o || i
          ? ((o.lat = Math.min(e.lat, o.lat)),
            (o.lng = Math.min(e.lng, o.lng)),
            (i.lat = Math.max(r.lat, i.lat)),
            (i.lng = Math.max(r.lng, i.lng)))
          : ((this._southWest = new c(e.lat, e.lng)),
            (this._northEast = new c(r.lat, r.lng))),
        this
      );
    },
    pad: function (t) {
      var e = this._southWest,
        r = this._northEast,
        o = Math.abs(e.lat - r.lat) * t,
        i = Math.abs(e.lng - r.lng) * t;
      return new u(new c(e.lat - o, e.lng - i), new c(r.lat + o, r.lng + i));
    },
    getCenter: function () {
      return new c(
        (this._southWest.lat + this._northEast.lat) / 2,
        (this._southWest.lng + this._northEast.lng) / 2,
      );
    },
    getSouthWest: function () {
      return this._southWest;
    },
    getNorthEast: function () {
      return this._northEast;
    },
    getNorthWest: function () {
      return new c(this.getNorth(), this.getWest());
    },
    getSouthEast: function () {
      return new c(this.getSouth(), this.getEast());
    },
    getWest: function () {
      return this._southWest.lng;
    },
    getSouth: function () {
      return this._southWest.lat;
    },
    getEast: function () {
      return this._northEast.lng;
    },
    getNorth: function () {
      return this._northEast.lat;
    },
    contains: function (t) {
      t = "number" == typeof t[0] || t instanceof c || "lat" in t ? f(t) : l(t);
      var e,
        r,
        o = this._southWest,
        i = this._northEast;
      return (
        t instanceof u
          ? ((e = t.getSouthWest()), (r = t.getNorthEast()))
          : (e = r = t),
        e.lat >= o.lat && r.lat <= i.lat && e.lng >= o.lng && r.lng <= i.lng
      );
    },
    intersects: function (t) {
      t = l(t);
      var e = this._southWest,
        r = this._northEast,
        o = t.getSouthWest(),
        i = t.getNorthEast(),
        n = i.lat >= e.lat && o.lat <= r.lat,
        a = i.lng >= e.lng && o.lng <= r.lng;
      return n && a;
    },
    overlaps: function (t) {
      t = l(t);
      var e = this._southWest,
        r = this._northEast,
        o = t.getSouthWest(),
        i = t.getNorthEast(),
        n = i.lat > e.lat && o.lat < r.lat,
        a = i.lng > e.lng && o.lng < r.lng;
      return n && a;
    },
    toBBoxString: function () {
      return [
        this.getWest(),
        this.getSouth(),
        this.getEast(),
        this.getNorth(),
      ].join(",");
    },
    equals: function (t, e) {
      return (
        !!t &&
        ((t = l(t)),
        this._southWest.equals(t.getSouthWest(), e) &&
          this._northEast.equals(t.getNorthEast(), e))
      );
    },
    isValid: function () {
      return !(!this._southWest || !this._northEast);
    },
  }));
var h = (function (t) {
  var e, r, o, i;
  for (r = 1, o = arguments.length; r < o; r++)
    for (e in (i = arguments[r])) t[e] = i[e];
  return t;
})(
  {},
  {
    latLngToPoint: function (t, e) {
      var r = this.projection.project(t),
        o = this.scale(e);
      return this.transformation._transform(r, o);
    },
    pointToLatLng: function (t, e) {
      var r = this.scale(e),
        o = this.transformation.untransform(t, r);
      return this.projection.unproject(o);
    },
    project: function (t) {
      return this.projection.project(t);
    },
    unproject: function (t) {
      return this.projection.unproject(t);
    },
    scale: function (t) {
      return 256 * Math.pow(2, t);
    },
    zoom: function (t) {
      return Math.log(t / 256) / Math.LN2;
    },
    getProjectedBounds: function (t) {
      if (this.infinite) return null;
      var e = this.projection.bounds,
        r = this.scale(t);
      return new a(
        this.transformation.transform(e.min, r),
        this.transformation.transform(e.max, r),
      );
    },
    infinite: !1,
    wrapLatLng: function (e) {
      var r = this.wrapLng ? t(e.lng, this.wrapLng, !0) : e.lng;
      return new c(this.wrapLat ? t(e.lat, this.wrapLat, !0) : e.lat, r, e.alt);
    },
    wrapLatLngBounds: function (t) {
      var e = t.getCenter(),
        r = this.wrapLatLng(e),
        o = e.lat - r.lat,
        i = e.lng - r.lng;
      if (0 === o && 0 === i) return t;
      var n = t.getSouthWest(),
        a = t.getNorthEast();
      return new u(new c(n.lat - o, n.lng - i), new c(a.lat - o, a.lng - i));
    },
  },
  {
    wrapLng: [-180, 180],
    R: 6371e3,
    distance: function (t, e) {
      var r = Math.PI / 180,
        o = t.lat * r,
        i = e.lat * r,
        n = Math.sin(((e.lat - t.lat) * r) / 2),
        a = Math.sin(((e.lng - t.lng) * r) / 2),
        s = n * n + Math.cos(o) * Math.cos(i) * a * a,
        u = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
      return this.R * u;
    },
  },
);
function c(t, e, r) {
  if (isNaN(t) || isNaN(e))
    throw new Error("Invalid LatLng object: (" + t + ", " + e + ")");
  ((this.lat = +t), (this.lng = +e), void 0 !== r && (this.alt = +r));
}
function f(t, e, o) {
  return t instanceof c
    ? t
    : r(t) && "object" != typeof t[0]
      ? 3 === t.length
        ? new c(t[0], t[1], t[2])
        : 2 === t.length
          ? new c(t[0], t[1])
          : null
      : null == t
        ? t
        : "object" == typeof t && "lat" in t
          ? new c(t.lat, "lng" in t ? t.lng : t.lon, t.alt)
          : void 0 === e
            ? null
            : new c(t, e, o);
}
c.prototype = {
  equals: function (t, e) {
    return (
      !!t &&
      ((t = f(t)),
      Math.max(Math.abs(this.lat - t.lat), Math.abs(this.lng - t.lng)) <=
        (void 0 === e ? 1e-9 : e))
    );
  },
  toString: function (t) {
    return "LatLng(" + e(this.lat, t) + ", " + e(this.lng, t) + ")";
  },
  distanceTo: function (t) {
    return h.distance(this, f(t));
  },
  wrap: function () {
    return h.wrapLatLng(this);
  },
  toBounds: function (t) {
    var e = (180 * t) / 40075017,
      r = e / Math.cos((Math.PI / 180) * this.lat);
    return l([this.lat - e, this.lng - r], [this.lat + e, this.lng + r]);
  },
  clone: function () {
    return new c(this.lat, this.lng, this.alt);
  },
};
const d = (t) => {
    const e = t.valueOf();
    return m(e);
  },
  m = (t) => {
    const e = t / 864e5 - 10957.5,
      r = 6.240059966692059 + 0.017201969994578018 * e,
      o =
        r +
        0.017453292519943295 *
          (1.9148 * Math.sin(r) +
            0.02 * Math.sin(2 * r) +
            3e-4 * Math.sin(3 * r)) +
        1.796593062783907 +
        Math.PI,
      i = Math.atan2(Math.sin(o) * Math.cos(0.40909994067971484), Math.cos(o));
    return {
      dec: Math.asin(Math.sin(0.40909994067971484) * Math.sin(o)),
      Hi:
        ((4.889714432387314 + 6.3003876824396166 * e - i) % (2 * Math.PI)) +
        2 * Math.PI,
    };
  },
  _ = () => Math.floor(1e7 * Math.random()),
  g = (t, e, r) => {
    const o = 1 / e,
      i = Math.min(t[0] * o, 255),
      n = Math.min(t[1] * o, 255),
      a = Math.min(t[2] * o, 255);
    let s = 0;
    return (
      i + n + a !== 0 &&
        (s = i > 0 ? (i / 255) * 0.5 + 0.5 : a > 0 ? 0.5 * (1 - a / 255) : 0.5),
      s * r
    );
  },
  x = (t = new Date(), e) => {
    const r = new Date(t.toLocaleString("en-US", { timeZone: "UTC" })),
      o = new Date(t.toLocaleString("en-US", e ? { timeZone: e } : {}));
    return r.getTime() - o.getTime();
  };
const p = (t) => {
  const e = () => !t.getPitch;
  return {
    project: (r, i) => {
      if (e()) return t.project(r, i);
      {
        const { lat: t, lng: e } = r;
        return new o(
          ((t, e) => ((t + 180) / 360) * Math.pow(2, e) * 256)(e, i),
          ((t, e) =>
            ((1 -
              Math.log(
                Math.tan((t * Math.PI) / 180) +
                  1 / Math.cos((t * Math.PI) / 180),
              ) /
                Math.PI) /
              2) *
            Math.pow(2, e) *
            256)(t, i),
        );
      }
    },
    unproject: (r, o) => {
      return e()
        ? t.unproject(r, o)
        : new c(
            ((i = r.y),
            (n = o),
            (a = Math.PI - (2 * Math.PI * i) / 256 / Math.pow(2, n)),
            (180 / Math.PI) * Math.atan(0.5 * (Math.exp(a) - Math.exp(-a)))),
            (function (t, e) {
              return (t / 256 / Math.pow(2, e)) * 360 - 180;
            })(r.x, o),
          );
      var i, n, a;
    },
    screenUnproject: (r) =>
      e() ? t.containerPointToLatLng(r) : t.unproject(r),
    getZoom: () => (e() ? t.getZoom() : t.getZoom() + 1),
    getCenter: () => t.getCenter(),
    getBounds: () => t.getBounds(),
    eachLayer: (r) => {
      e() && t.eachLayer(r);
    },
    getBearing: () => (e() ? 0 : t.getBearing()),
    getPitch: () => (e() ? 0 : t.getPitch()),
    rawMap: () => t,
    isLeaflet: e,
    getPixelDimensions: () => {
      const e = t.getContainer();
      return { width: e.clientWidth, height: e.clientHeight };
    },
    createBounds: (t) => {
      const { nw: e, se: r } = t;
      return new u(e, r);
    },
  };
};
function E(t, e, r, o) {
  return new (r || (r = Promise))(function (i, n) {
    function a(t) {
      try {
        u(o.next(t));
      } catch (t) {
        n(t);
      }
    }
    function s(t) {
      try {
        u(o.throw(t));
      } catch (t) {
        n(t);
      }
    }
    function u(t) {
      var e;
      t.done
        ? i(t.value)
        : ((e = t.value),
          e instanceof r
            ? e
            : new r(function (t) {
                t(e);
              })).then(a, s);
    }
    u((o = o.apply(t, e || [])).next());
  });
}
function v(t, e, r) {
  r = r || 2;
  var o,
    i,
    n,
    a,
    s,
    u,
    l,
    h = e && e.length,
    c = h ? e[0] * r : t.length,
    f = T(t, 0, c, r, !0),
    d = [];
  if (!f || f.next === f.prev) return d;
  if (
    (h &&
      (f = (function (t, e, r, o) {
        var i,
          n,
          a,
          s = [];
        for (i = 0, n = e.length; i < n; i++)
          ((a = T(t, e[i] * o, i < n - 1 ? e[i + 1] * o : t.length, o, !1)) ===
            a.next && (a.steiner = !0),
            s.push(S(a)));
        for (s.sort(F), i = 0; i < s.length; i++) r = D(s[i], r);
        return r;
      })(t, e, f, r)),
    t.length > 80 * r)
  ) {
    ((o = n = t[0]), (i = a = t[1]));
    for (var m = r; m < c; m += r)
      ((s = t[m]) < o && (o = s),
        (u = t[m + 1]) < i && (i = u),
        s > n && (n = s),
        u > a && (a = u));
    l = 0 !== (l = Math.max(n - o, a - i)) ? 32767 / l : 0;
  }
  return (A(f, d, r, o, i, l, 0), d);
}
function T(t, e, r, o, i) {
  var n, a;
  if (i === Y(t, e, r, o) > 0)
    for (n = e; n < r; n += o) a = H(n, t[n], t[n + 1], a);
  else for (n = r - o; n >= e; n -= o) a = H(n, t[n], t[n + 1], a);
  return (a && B(a, a.next) && (W(a), (a = a.next)), a);
}
function y(t, e) {
  if (!t) return t;
  e || (e = t);
  var r,
    o = t;
  do {
    if (((r = !1), o.steiner || (!B(o, o.next) && 0 !== I(o.prev, o, o.next))))
      o = o.next;
    else {
      if ((W(o), (o = e = o.prev) === o.next)) break;
      r = !0;
    }
  } while (r || o !== e);
  return e;
}
function A(t, e, r, o, i, n, a) {
  if (t) {
    !a &&
      n &&
      (function (t, e, r, o) {
        var i = t;
        do {
          (0 === i.z && (i.z = U(i.x, i.y, e, r, o)),
            (i.prevZ = i.prev),
            (i.nextZ = i.next),
            (i = i.next));
        } while (i !== t);
        ((i.prevZ.nextZ = null),
          (i.prevZ = null),
          (function (t) {
            var e,
              r,
              o,
              i,
              n,
              a,
              s,
              u,
              l = 1;
            do {
              for (r = t, t = null, n = null, a = 0; r; ) {
                for (
                  a++, o = r, s = 0, e = 0;
                  e < l && (s++, (o = o.nextZ));
                  e++
                );
                for (u = l; s > 0 || (u > 0 && o); )
                  (0 !== s && (0 === u || !o || r.z <= o.z)
                    ? ((i = r), (r = r.nextZ), s--)
                    : ((i = o), (o = o.nextZ), u--),
                    n ? (n.nextZ = i) : (t = i),
                    (i.prevZ = n),
                    (n = i));
                r = o;
              }
              ((n.nextZ = null), (l *= 2));
            } while (a > 1);
          })(i));
      })(t, o, i, n);
    for (var s, u, l = t; t.prev !== t.next; )
      if (((s = t.prev), (u = t.next), n ? R(t, o, i, n) : b(t)))
        (e.push((s.i / r) | 0),
          e.push((t.i / r) | 0),
          e.push((u.i / r) | 0),
          W(t),
          (t = u.next),
          (l = u.next));
      else if ((t = u) === l) {
        a
          ? 1 === a
            ? A((t = M(y(t), e, r)), e, r, o, i, n, 2)
            : 2 === a && w(t, e, r, o, i, n)
          : A(y(t), e, r, o, i, n, 1);
        break;
      }
  }
}
function b(t) {
  var e = t.prev,
    r = t,
    o = t.next;
  if (I(e, r, o) >= 0) return !1;
  for (
    var i = e.x,
      n = r.x,
      a = o.x,
      s = e.y,
      u = r.y,
      l = o.y,
      h = i < n ? (i < a ? i : a) : n < a ? n : a,
      c = s < u ? (s < l ? s : l) : u < l ? u : l,
      f = i > n ? (i > a ? i : a) : n > a ? n : a,
      d = s > u ? (s > l ? s : l) : u > l ? u : l,
      m = o.next;
    m !== e;

  ) {
    if (
      m.x >= h &&
      m.x <= f &&
      m.y >= c &&
      m.y <= d &&
      C(i, s, n, u, a, l, m.x, m.y) &&
      I(m.prev, m, m.next) >= 0
    )
      return !1;
    m = m.next;
  }
  return !0;
}
function R(t, e, r, o) {
  var i = t.prev,
    n = t,
    a = t.next;
  if (I(i, n, a) >= 0) return !1;
  for (
    var s = i.x,
      u = n.x,
      l = a.x,
      h = i.y,
      c = n.y,
      f = a.y,
      d = s < u ? (s < l ? s : l) : u < l ? u : l,
      m = h < c ? (h < f ? h : f) : c < f ? c : f,
      _ = s > u ? (s > l ? s : l) : u > l ? u : l,
      g = h > c ? (h > f ? h : f) : c > f ? c : f,
      x = U(d, m, e, r, o),
      p = U(_, g, e, r, o),
      E = t.prevZ,
      v = t.nextZ;
    E && E.z >= x && v && v.z <= p;

  ) {
    if (
      E.x >= d &&
      E.x <= _ &&
      E.y >= m &&
      E.y <= g &&
      E !== i &&
      E !== a &&
      C(s, h, u, c, l, f, E.x, E.y) &&
      I(E.prev, E, E.next) >= 0
    )
      return !1;
    if (
      ((E = E.prevZ),
      v.x >= d &&
        v.x <= _ &&
        v.y >= m &&
        v.y <= g &&
        v !== i &&
        v !== a &&
        C(s, h, u, c, l, f, v.x, v.y) &&
        I(v.prev, v, v.next) >= 0)
    )
      return !1;
    v = v.nextZ;
  }
  for (; E && E.z >= x; ) {
    if (
      E.x >= d &&
      E.x <= _ &&
      E.y >= m &&
      E.y <= g &&
      E !== i &&
      E !== a &&
      C(s, h, u, c, l, f, E.x, E.y) &&
      I(E.prev, E, E.next) >= 0
    )
      return !1;
    E = E.prevZ;
  }
  for (; v && v.z <= p; ) {
    if (
      v.x >= d &&
      v.x <= _ &&
      v.y >= m &&
      v.y <= g &&
      v !== i &&
      v !== a &&
      C(s, h, u, c, l, f, v.x, v.y) &&
      I(v.prev, v, v.next) >= 0
    )
      return !1;
    v = v.nextZ;
  }
  return !0;
}
function M(t, e, r) {
  var o = t;
  do {
    var i = o.prev,
      n = o.next.next;
    (!B(i, n) &&
      N(i, o, o.next, n) &&
      z(i, n) &&
      z(n, i) &&
      (e.push((i.i / r) | 0),
      e.push((o.i / r) | 0),
      e.push((n.i / r) | 0),
      W(o),
      W(o.next),
      (o = t = n)),
      (o = o.next));
  } while (o !== t);
  return y(o);
}
function w(t, e, r, o, i, n) {
  var a = t;
  do {
    for (var s = a.next.next; s !== a.prev; ) {
      if (a.i !== s.i && P(a, s)) {
        var u = G(a, s);
        return (
          (a = y(a, a.next)),
          (u = y(u, u.next)),
          A(a, e, r, o, i, n, 0),
          void A(u, e, r, o, i, n, 0)
        );
      }
      s = s.next;
    }
    a = a.next;
  } while (a !== t);
}
function F(t, e) {
  return t.x - e.x;
}
function D(t, e) {
  var r = (function (t, e) {
    var r,
      o = e,
      i = t.x,
      n = t.y,
      a = -1 / 0;
    do {
      if (n <= o.y && n >= o.next.y && o.next.y !== o.y) {
        var s = o.x + ((n - o.y) * (o.next.x - o.x)) / (o.next.y - o.y);
        if (
          s <= i &&
          s > a &&
          ((a = s), (r = o.x < o.next.x ? o : o.next), s === i)
        )
          return r;
      }
      o = o.next;
    } while (o !== e);
    if (!r) return null;
    var u,
      l = r,
      h = r.x,
      c = r.y,
      f = 1 / 0;
    o = r;
    do {
      (i >= o.x &&
        o.x >= h &&
        i !== o.x &&
        C(n < c ? i : a, n, h, c, n < c ? a : i, n, o.x, o.y) &&
        ((u = Math.abs(n - o.y) / (i - o.x)),
        z(o, t) &&
          (u < f || (u === f && (o.x > r.x || (o.x === r.x && L(r, o))))) &&
          ((r = o), (f = u))),
        (o = o.next));
    } while (o !== l);
    return r;
  })(t, e);
  if (!r) return e;
  var o = G(r, t);
  return (y(o, o.next), y(r, r.next));
}
function L(t, e) {
  return I(t.prev, t, e.prev) < 0 && I(e.next, t, t.next) < 0;
}
function U(t, e, r, o, i) {
  return (
    (t =
      1431655765 &
      ((t =
        858993459 &
        ((t =
          252645135 &
          ((t = 16711935 & ((t = ((t - r) * i) | 0) | (t << 8))) | (t << 4))) |
          (t << 2))) |
        (t << 1))) |
    ((e =
      1431655765 &
      ((e =
        858993459 &
        ((e =
          252645135 &
          ((e = 16711935 & ((e = ((e - o) * i) | 0) | (e << 8))) | (e << 4))) |
          (e << 2))) |
        (e << 1))) <<
      1)
  );
}
function S(t) {
  var e = t,
    r = t;
  do {
    ((e.x < r.x || (e.x === r.x && e.y < r.y)) && (r = e), (e = e.next));
  } while (e !== t);
  return r;
}
function C(t, e, r, o, i, n, a, s) {
  return (
    (i - a) * (e - s) >= (t - a) * (n - s) &&
    (t - a) * (o - s) >= (r - a) * (e - s) &&
    (r - a) * (n - s) >= (i - a) * (o - s)
  );
}
function P(t, e) {
  return (
    t.next.i !== e.i &&
    t.prev.i !== e.i &&
    !(function (t, e) {
      var r = t;
      do {
        if (
          r.i !== t.i &&
          r.next.i !== t.i &&
          r.i !== e.i &&
          r.next.i !== e.i &&
          N(r, r.next, t, e)
        )
          return !0;
        r = r.next;
      } while (r !== t);
      return !1;
    })(t, e) &&
    ((z(t, e) &&
      z(e, t) &&
      (function (t, e) {
        var r = t,
          o = !1,
          i = (t.x + e.x) / 2,
          n = (t.y + e.y) / 2;
        do {
          (r.y > n != r.next.y > n &&
            r.next.y !== r.y &&
            i < ((r.next.x - r.x) * (n - r.y)) / (r.next.y - r.y) + r.x &&
            (o = !o),
            (r = r.next));
        } while (r !== t);
        return o;
      })(t, e) &&
      (I(t.prev, t, e.prev) || I(t, e.prev, e))) ||
      (B(t, e) && I(t.prev, t, t.next) > 0 && I(e.prev, e, e.next) > 0))
  );
}
function I(t, e, r) {
  return (e.y - t.y) * (r.x - e.x) - (e.x - t.x) * (r.y - e.y);
}
function B(t, e) {
  return t.x === e.x && t.y === e.y;
}
function N(t, e, r, o) {
  var i = X(I(t, e, r)),
    n = X(I(t, e, o)),
    a = X(I(r, o, t)),
    s = X(I(r, o, e));
  return (
    (i !== n && a !== s) ||
    !(0 !== i || !O(t, r, e)) ||
    !(0 !== n || !O(t, o, e)) ||
    !(0 !== a || !O(r, t, o)) ||
    !(0 !== s || !O(r, e, o))
  );
}
function O(t, e, r) {
  return (
    e.x <= Math.max(t.x, r.x) &&
    e.x >= Math.min(t.x, r.x) &&
    e.y <= Math.max(t.y, r.y) &&
    e.y >= Math.min(t.y, r.y)
  );
}
function X(t) {
  return t > 0 ? 1 : t < 0 ? -1 : 0;
}
function z(t, e) {
  return I(t.prev, t, t.next) < 0
    ? I(t, e, t.next) >= 0 && I(t, t.prev, e) >= 0
    : I(t, e, t.prev) < 0 || I(t, t.next, e) < 0;
}
function G(t, e) {
  var r = new j(t.i, t.x, t.y),
    o = new j(e.i, e.x, e.y),
    i = t.next,
    n = e.prev;
  return (
    (t.next = e),
    (e.prev = t),
    (r.next = i),
    (i.prev = r),
    (o.next = r),
    (r.prev = o),
    (n.next = o),
    (o.prev = n),
    o
  );
}
function H(t, e, r, o) {
  var i = new j(t, e, r);
  return (
    o
      ? ((i.next = o.next), (i.prev = o), (o.next.prev = i), (o.next = i))
      : ((i.prev = i), (i.next = i)),
    i
  );
}
function W(t) {
  ((t.next.prev = t.prev),
    (t.prev.next = t.next),
    t.prevZ && (t.prevZ.nextZ = t.nextZ),
    t.nextZ && (t.nextZ.prevZ = t.prevZ));
}
function j(t, e, r) {
  ((this.i = t),
    (this.x = e),
    (this.y = r),
    (this.prev = null),
    (this.next = null),
    (this.z = 0),
    (this.prevZ = null),
    (this.nextZ = null),
    (this.steiner = !1));
}
function Y(t, e, r, o) {
  for (var i = 0, n = e, a = r - o; n < r; n += o)
    ((i += (t[a] - t[n]) * (t[n + 1] + t[a + 1])), (a = n));
  return i;
}
function Z(t) {
  t.filter((t) => "MultiPolygon" === t.geometry.type).forEach((e) => {
    const { geometry: r, properties: o, type: i } = e;
    if ("MultiPolygon" === r.type)
      for (let o = 0; o < r.coordinates.length; o++)
        t.push(
          Object.assign(Object.assign({}, e), {
            geometry: Object.assign(Object.assign({}, r), {
              type: "Polygon",
              coordinates: r.coordinates[o],
            }),
          }),
        );
  });
  return t
    .filter((t) => "Polygon" === t.geometry.type)
    .map((t) => {
      const { geometry: e, properties: r } = t,
        o = v.flatten(e.coordinates),
        i = new Float32Array(
          o.vertices.map((t, e) => {
            return e % 2 == 1
              ? ((r = t),
                (180 -
                  (180 / Math.PI) *
                    Math.log(Math.tan(Math.PI / 4 + (r * Math.PI) / 360))) /
                  360)
              : (180 + t) / 360;
            var r;
          }),
        ),
        n = v(o.vertices, o.holes, o.dimensions),
        a = n.length > 256 ? new Uint16Array(n) : new Uint8Array(n),
        s = (function (t) {
          const { height: e = 0, levels: r = 0, render_height: o = 0 } = t;
          if (r) return 3.04 * r;
          return Math.max(e, o);
        })(r),
        u = r.highlight || !1;
      let l = 0,
        h = 0,
        c = 0;
      for (let t = 0; t < i.length; t += 2) ((l += i[t]), (h += i[t + 1]), c++);
      return {
        aPosition: i,
        cuts: a,
        buildingHeight: s,
        centroid: [l / c, h / c],
        highlight: u,
      };
    });
}
((v.deviation = function (t, e, r, o) {
  var i = e && e.length,
    n = i ? e[0] * r : t.length,
    a = Math.abs(Y(t, 0, n, r));
  if (i)
    for (var s = 0, u = e.length; s < u; s++) {
      var l = e[s] * r,
        h = s < u - 1 ? e[s + 1] * r : t.length;
      a -= Math.abs(Y(t, l, h, r));
    }
  var c = 0;
  for (s = 0; s < o.length; s += 3) {
    var f = o[s] * r,
      d = o[s + 1] * r,
      m = o[s + 2] * r;
    c += Math.abs(
      (t[f] - t[m]) * (t[d + 1] - t[f + 1]) -
        (t[f] - t[d]) * (t[m + 1] - t[f + 1]),
    );
  }
  return 0 === a && 0 === c ? 0 : Math.abs((c - a) / a);
}),
  (v.flatten = function (t) {
    for (
      var e = t[0][0].length,
        r = { vertices: [], holes: [], dimensions: e },
        o = 0,
        i = 0;
      i < t.length;
      i++
    ) {
      for (var n = 0; n < t[i].length; n++)
        for (var a = 0; a < e; a++) r.vertices.push(t[i][n][a]);
      i > 0 && ((o += t[i - 1].length), r.holes.push(o));
    }
    return r;
  }));
const K = (t, e) => {
    const { lat: r, lng: i } = t;
    return new o(
      ((t, e) => ((t + 180) / 360) * Math.pow(2, e) * 256)(i, e),
      ((t, e) =>
        ((1 -
          Math.log(
            Math.tan((t * Math.PI) / 180) + 1 / Math.cos((t * Math.PI) / 180),
          ) /
            Math.PI) /
          2) *
        Math.pow(2, e) *
        256)(r, e),
    );
  },
  k = (t, e) => {
    return new c(
      ((r = t.y),
      (o = e),
      (i = Math.PI - (2 * Math.PI * r) / 256 / Math.pow(2, o)),
      (180 / Math.PI) * Math.atan(0.5 * (Math.exp(i) - Math.exp(-i)))),
      (function (t, e) {
        return (t / 256 / Math.pow(2, e)) * 360 - 180;
      })(t.x, e),
    );
    var r, o, i;
  };
let V,
  q = {
    heightMapTex: null,
    width: 0,
    height: 0,
    visibleDEMPixelBounds: new a(new o(0, 0), new o(0, 0)),
    DEMPixelBounds: new a(new o(0, 0), new o(0, 0)),
    maxHeight: 8848,
    raster: [],
    demZoom: 0,
    dirty: !1,
    outputWidth: 0,
    outputHeight: 0,
  };
const $ = (t) =>
    E(void 0, void 0, void 0, function* () {
      const {
          demZoom: e,
          getFeatures: r,
          terrainSource: i,
          canopySource: n,
          dsmSource: s,
          tileLoaded: l,
          gl: h,
          bounds: c,
          buildingRasterizer: f,
          tileMerger: d,
          canopyMerger: m,
          forceUpdate: _ = !1,
        } = t,
        {
          getSourceUrl: g,
          getElevation: x,
          maxZoom: p,
          tileSize: v,
          _overzoom: T,
        } = i,
        y =
          ((A = { getFeatures: r }),
          E(void 0, void 0, void 0, function* () {
            const { getFeatures: t } = A;
            try {
              return Z(yield t());
            } catch (t) {
              console.log("Error merging buildings", t);
            }
            return [];
          }));
      var A;
      try {
        const t = c,
          r = t.getNorthWest(),
          i = t.getSouthEast(),
          E = new a(K(r, e), K(i, e));
        let T = new o(E.min.x, E.min.y),
          A = E.max.x - E.min.x;
        const b = E.max.y - E.min.y,
          R = E.max.subtract(E.min);
        R.y > R.x && ((T.x -= 256), (A += 512));
        const M = ((t) => {
            const { upperLeft: e, width: r, height: o } = t,
              i = e.divideBy(256).floor().multiplyBy(256),
              n = 256 * (Math.ceil(r / 256) + 1),
              s = 256 * (Math.ceil(o / 256) + 1),
              u = i.add([n, s]);
            return new a(i, u);
          })({ upperLeft: T, width: A, height: b }),
          { x: w, y: F } = M.max.subtract(M.min),
          D = ((t) => {
            t.sort((t, e) => (t.y !== e.y ? t.y - e.y : t.x - e.x));
            const e = t.reduce((t, e) => (e.x < t.x ? e : t)).x,
              r = t.reduce((t, e) => (e.y < t.y ? e : t)).y;
            return t.map((t) => {
              const o = Math.pow(2, t.z);
              return {
                x: ((t.x % o) + o) % o,
                y: ((t.y % o) + o) % o,
                z: t.z,
                xOffset: 256 * (t.x - e),
                yOffset: 256 * (t.y - r),
              };
            });
          })(
            ((t) => {
              const { upperLeft: e, width: r, height: o, zoom: i } = t,
                n = e.divideBy(256).floor(),
                a = n.x + r / 256,
                s = Math.min(n.y + o / 256, Math.pow(2, i) - 1),
                u = [];
              for (var l = n.x; l < a; l++)
                for (var h = n.y; h < s; h++) u.push({ x: l, y: h, z: i });
              return u;
            })({ upperLeft: M.min, width: w, height: F, zoom: e }),
          ),
          L = E.max.x - E.min.x,
          U = E.max.y - E.min.y,
          S = Math.round(L),
          C = Math.round(U),
          P = JSON.stringify(D);
        if (!_ && P === V && e < p)
          return (
            (q = Object.assign(Object.assign({}, q), {
              outputWidth: S,
              outputHeight: C,
              visibleDEMPixelBounds: E,
              demZoom: e,
              dirty: !0,
            })),
            q
          );
        const I = [
          d.merge(D, {
            maxZoom: p,
            width: w,
            height: F,
            crossOrigin: "Anonymous",
            getSourceUrl: g,
            getElevation: x,
            tileSize: v,
            tileLoaded: l,
          }),
        ];
        if (void 0 !== n) {
          const t = m.merge(D, {
            maxZoom: n.maxZoom,
            width: w,
            height: F,
            crossOrigin: "Anonymous",
            getSourceUrl: n.getSourceUrl,
            getElevation: n.getElevation,
            tileSize: n.tileSize,
            tileLoaded: l,
          });
          I.push(t);
        } else
          I.push(
            new Promise((t) => {
              const e = h.createTexture();
              (h.activeTexture(h.TEXTURE2),
                h.bindTexture(h.TEXTURE_2D, e),
                h.texImage2D(
                  h.TEXTURE_2D,
                  0,
                  h.RGBA,
                  1,
                  1,
                  0,
                  h.RGBA,
                  h.UNSIGNED_BYTE,
                  new Uint8ClampedArray([0, 0, 0, 0]),
                ),
                t(e));
            }),
          );
        const [B, N] = yield Promise.all(I);
        if (null === B || null === N)
          return (
            (q = Object.assign(Object.assign({}, q), {
              visibleDEMPixelBounds: E,
              demZoom: e,
              dirty: !1,
            })),
            q
          );
        const O = new a(
            K(new u(s.bounds).getNorthWest(), e),
            K(new u(s.bounds).getSouthEast(), e),
          ),
          X = O.min.subtract(M.min),
          z = O.max.subtract(M.min),
          G = [X.x / w, X.y / F, z.x / w, z.y / F].map((t) => 2 * t - 1),
          H = yield y,
          { maxHeight: W, heightMapTex: j } = f.raster({
            upperLeftTile: D[0],
            width: w,
            height: F,
            mapZoom: e,
            features: H,
            imageData: B,
            gl: h,
            dsmSource: s,
            dsmCoords: G,
            canopyData: N,
          }),
          Y = Math.max(s.maxHeight, B.maxHeight + W);
        ((V = P),
          (q = {
            heightMapTex: j,
            maxHeight: Y,
            width: w,
            height: F,
            DEMPixelBounds: M,
            visibleDEMPixelBounds: E,
            raster: D,
            demZoom: e,
            dirty: !0,
            outputWidth: S,
            outputHeight: C,
          }));
      } catch (t) {
        console.error("Could not decode height map", t);
      }
      return q;
    }),
  J = (t, e) => {
    const { r: r, g: o, b: i } = t;
    return [r / 255, o / 255, i / 255, e];
  },
  Q = (t, e) => {
    const { date: r } = e,
      { dec: o, Hi: i } = d(r);
    t.updateDate({ dec: o, Hi: i });
  },
  tt = (t, e) =>
    E(void 0, void 0, void 0, function* () {
      return yield t.updateDateRange(Object.assign({}, e));
    }),
  et = (t, e) => {
    const { color: r, opacity: o } = e,
      i = J(r, o);
    t.updateColor({ colorVec: i });
  },
  rt = (t) => {
    const {
      kernel: e,
      map: r,
      heightMap: o,
      now: i,
      color: n,
      opacity: a,
      belowCanopy: s,
      skipRender: l,
    } = t;
    try {
      const {
        heightMapTex: t,
        outputHeight: h,
        outputWidth: c,
        maxHeight: f,
        width: m,
        height: _,
        DEMPixelBounds: g,
        visibleDEMPixelBounds: x,
        demZoom: p,
      } = o;
      if (0 === m || 0 === _) return;
      const { min: E, max: v } = x;
      if (!E || !v) return;
      const { x: T, y: y } = v.subtract(E),
        A = g.min,
        b = r.getPixelDimensions(),
        R = r.screenUnproject([0, 0]),
        M = r.screenUnproject([b.width, 0]),
        w = r.screenUnproject([b.width, b.height]),
        F = r.screenUnproject([0, b.height]),
        D = [F, w, R, M].map((t) => r.project(t, p)),
        L = D.map((t) => [(t.x - A.x) / m, (t.y - A.y) / _]).flat(),
        U = D.map((t) => [(t.x - E.x) / T, (t.y - E.y) / y])
          .map((t) => [2 * t[0] - 1, (2 * t[1] - 1) * (r.isLeaflet() ? -1 : 1)])
          .flat(),
        S = A.y / 256 / Math.pow(2, p),
        C = _ / 256 / Math.pow(2, p),
        P = new u(k(g.getTopLeft(), p), k(g.getBottomRight(), p)),
        I = P.getWest(),
        B = Math.abs(P.getWest() - P.getEast());
      ((t, e) => {
        const { color: r, opacity: o, date: i } = e,
          n = J(r, o),
          { dec: a, Hi: s } = d(i);
        t.updateHeightMap(
          Object.assign({ dec: a, Hi: s, colorVec: n, step: 1 }, e),
        );
      })(e, {
        heightMapTex: t,
        maxHeight: f,
        width: m,
        height: _,
        heightMapZoom: p,
        cornerTextureCoords: L,
        cornerClipCoords: U,
        topYCoord: S,
        ySize: C,
        west: I,
        dLng: B,
        date: i,
        color: n,
        opacity: a,
        outputHeight: h,
        outputWidth: c,
        belowCanopy: s,
        skipRender: l,
      });
    } catch (t) {
      console.error("EXCEPTION", t);
    }
  };
const ot = (t) => {
  const { gl: e } = t,
    {
      texture: r,
      imageData: o = null,
      format: i = e.RGBA,
      width: n,
      height: a,
      filter: s = e.NEAREST,
      wrap: u = e.CLAMP_TO_EDGE,
      type: l = e.UNSIGNED_BYTE,
      internalFormat: h = i,
    } = t;
  (e.bindTexture(e.TEXTURE_2D, r),
    e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, u),
    e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, u),
    e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, s),
    e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, s),
    e.texImage2D(e.TEXTURE_2D, 0, h, n, a, 0, i, l, o));
};
function it(t) {
  const { gl: e, vSrc: r, fSrc: o } = t,
    i = e.createShader(e.VERTEX_SHADER);
  (e.shaderSource(i, r), e.compileShader(i));
  const n = e.createShader(e.FRAGMENT_SHADER);
  (e.shaderSource(n, o), e.compileShader(n));
  const a = e.createProgram();
  return (e.attachShader(a, i), e.attachShader(a, n), e.linkProgram(a), a);
}
class nt {
  constructor(t) {
    ((this.gl = t),
      (this.program = it({
        gl: t,
        vSrc: "\nuniform vec3 xyz;\nuniform vec2 dimensions;\nuniform bool use_dsm;\nuniform vec2 u_centroid;\nuniform sampler2D height_map;\nattribute vec2 dsm_position;\nattribute vec2 a_position;\nvarying vec2 vCoord;\nvarying float v_use_dsm;\nvarying vec4 v_elevation;\n\n\tvoid main() {\n\t\tif (use_dsm == true) {\n\t\t\tgl_Position = vec4(a_position, 0, 1);\n\t\t\tvCoord = dsm_position;\n      v_use_dsm = 1.0;\n\t\t\treturn;\n\t\t}\n\t\tif (abs(a_position) == vec2(1,1)) {\n\t\t\tgl_Position = vec4(a_position, 0, 1);\n\t\t\tvCoord = a_position * 0.5 + 0.5;\n\t\t\treturn;\n\t\t}\n\t\tfloat x = a_position.x - xyz.x;\n\t\tfloat y = a_position.y - xyz.y;\n\t\tvec2 transformed = vec2(x, y);\n\t\tvec2 normalized = transformed / dimensions;\n\t\tvec2 final = normalized * 2.0 - 1.0;\n    v_elevation = texture2D(height_map, vec2(u_centroid.x, u_centroid.y));\n    vCoord = normalized;\n\t\tgl_Position = vec4(final, 0, 1);\n\t}\n",
        fSrc: "\n#ifdef GL_FRAGMENT_PRECISION_HIGH\n  precision highp float;\n#else\n  precision mediump float;\n#endif\n\nuniform vec4 color;\nuniform sampler2D height_map;\nuniform sampler2D canopy_map;\nvarying vec2 vCoord;\nvarying float v_use_dsm;\nvarying vec4 v_elevation;\n\nvec4 addElevation(vec4 color, vec4 toAdd) {\n  float ground = (color.r * 255.0 * 255.0 + color.g * 255.0);\n  float building = (toAdd.r * 255.0 * 255.0 + toAdd.g * 255.0);\n  float elevation = ground + building;\n  float r = floor(elevation / 255.0) / 255.0;\n  float g = floor(mod(elevation, 255.0)) / 255.0;\n  return vec4(r, g, r, g);\n}\n\nvoid main() {\n\tif (color == vec4(1,1,1,1)) {\n\t \tvec4 textureColor = texture2D(height_map, vec2(vCoord.x, vCoord.y));\n\t \tvec4 canopyColor = texture2D(canopy_map, vec2(vCoord.x, vCoord.y));\n    if (v_use_dsm == 1.0) {\n\t \t  gl_FragColor = vec4(0.0, 0.0, textureColor.b, textureColor.a);\n      if (gl_FragColor.zw == vec2(0.0)) {\n        discard;\n      }\n    } else {\n      float upper = textureColor.r + canopyColor.r;\n      float combined = textureColor.g + canopyColor.g;\n      if (combined > 1.0) {\n        combined = combined - floor(combined);\n        upper += 1.0 / 255.0;\n      }\n      gl_FragColor = vec4(textureColor.r, textureColor.g, upper, combined);\n    }\n    // DSM noData values should not be included in heightMap because they produce ugly borders\n\t\treturn;\n  }\n  if (color == vec4(0,0,0,0)) {\n\t \tvec4 textureColor = texture2D(height_map, vec2(vCoord.x, vCoord.y));\n    gl_FragColor = vec4(textureColor.r, textureColor.g, textureColor.r, textureColor.g);\n    return;\n  }\n  vec4 final = addElevation(v_elevation, color);\n\tgl_FragColor = final;\n}\n",
      })),
      (this.positionAttributeLocation = t.getAttribLocation(
        this.program,
        "a_position",
      )),
      (this.dsmAttributeLocation = t.getAttribLocation(
        this.program,
        "dsm_position",
      )),
      (this.useDSMUniformLocation = t.getUniformLocation(
        this.program,
        "use_dsm",
      )),
      (this.xyzUniformLocation = t.getUniformLocation(this.program, "xyz")),
      (this.dimensionsUniformLocation = t.getUniformLocation(
        this.program,
        "dimensions",
      )),
      (this.heightMapUniformLocation = t.getUniformLocation(
        this.program,
        "height_map",
      )),
      (this.canopyMapUniformLocation = t.getUniformLocation(
        this.program,
        "canopy_map",
      )),
      (this.centroidUniformLocation = t.getUniformLocation(
        this.program,
        "u_centroid",
      )),
      (this.colorUniformLocation = t.getUniformLocation(this.program, "color")),
      (this.positionBuffer = t.createBuffer()),
      (this.dsmBuffer = t.createBuffer()),
      (this.indexBuffer = t.createBuffer()),
      (this.targetTexture = t.createTexture()));
  }
  raster(t) {
    const {
        features: e,
        upperLeftTile: r,
        mapZoom: i,
        width: n,
        height: a,
        imageData: s,
        dsmCoords: u,
        dsmSource: l,
        canopyData: h,
        gl: c,
      } = t,
      { x: f, y: d, z: m } = r;
    let _ = 0;
    (c.useProgram(this.program),
      c.activeTexture(c.TEXTURE1),
      c.bindTexture(c.TEXTURE_2D, s),
      c.activeTexture(c.TEXTURE2),
      c.bindTexture(c.TEXTURE_2D, h));
    const g = n,
      x = a;
    (c.activeTexture(c.TEXTURE0),
      c.bindTexture(c.TEXTURE_2D, this.targetTexture),
      c.texImage2D(
        c.TEXTURE_2D,
        0,
        c.RGBA,
        g,
        x,
        0,
        c.RGBA,
        c.UNSIGNED_BYTE,
        null,
      ),
      i > 15 && e.length > 5
        ? (c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.NEAREST),
          c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.NEAREST))
        : (c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.LINEAR),
          c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.LINEAR)),
      c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE),
      c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE),
      c.viewport(0, 0, g, x));
    const p = c.createFramebuffer();
    c.bindFramebuffer(c.FRAMEBUFFER, p);
    const E = c.COLOR_ATTACHMENT0;
    (c.framebufferTexture2D(
      c.FRAMEBUFFER,
      E,
      c.TEXTURE_2D,
      this.targetTexture,
      0,
    ),
      c.disable(c.BLEND),
      c.bindBuffer(c.ARRAY_BUFFER, this.positionBuffer),
      c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, this.indexBuffer),
      c.clearColor(0, 0, 0, 0),
      c.clear(c.COLOR_BUFFER_BIT));
    const v = f / Math.pow(2, m),
      T = d / Math.pow(2, m),
      y = new o(v, T),
      A = n / 256 / Math.pow(2, m),
      b = a / 256 / Math.pow(2, m);
    (c.uniform3f(this.xyzUniformLocation, v, T, m),
      c.uniform2f(this.dimensionsUniformLocation, A, b),
      c.uniform1i(this.heightMapUniformLocation, 1),
      c.uniform1i(this.canopyMapUniformLocation, 2),
      c.uniform1i(this.useDSMUniformLocation, 0));
    const R = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    if (
      (c.enableVertexAttribArray(this.positionAttributeLocation),
      c.bufferData(c.ARRAY_BUFFER, R, c.STATIC_DRAW),
      c.vertexAttribPointer(
        this.positionAttributeLocation,
        2,
        c.FLOAT,
        !1,
        0,
        0,
      ),
      c.uniform4f(this.colorUniformLocation, 1, 1, 1, 1),
      c.drawArrays(c.TRIANGLE_STRIP, 0, 4),
      e
        .filter((t) => !t.highlight)
        .forEach((t) => {
          const {
              buildingHeight: e,
              aPosition: r,
              cuts: i,
              centroid: s,
              highlight: u,
            } = t,
            l = new o(s[0], s[1])
              .subtract(y)
              .unscaleBy(new o(A, b))
              .scaleBy(new o(n, a))
              .floor();
          if (l.x < 0 || l.y < 0 || l.x > n || l.y > a) return;
          const h = l.x / n,
            f = l.y / a,
            d = 5 * e,
            m = Math.floor(d / 255) / 255,
            g = Math.floor(d % 255) / 255;
          ((_ = Math.max(_, e)),
            c.uniform2f(this.centroidUniformLocation, h, f),
            c.uniform4f(this.colorUniformLocation, m, g, m, g),
            c.bufferData(c.ARRAY_BUFFER, r, c.DYNAMIC_DRAW),
            c.vertexAttribPointer(
              this.positionAttributeLocation,
              2,
              c.FLOAT,
              !1,
              0,
              0,
            ),
            c.bufferData(c.ARRAY_BUFFER, r, c.DYNAMIC_DRAW),
            c.vertexAttribPointer(
              this.dsmAttributeLocation,
              2,
              c.FLOAT,
              !1,
              0,
              0,
            ),
            c.bufferData(c.ELEMENT_ARRAY_BUFFER, i, c.DYNAMIC_DRAW),
            c.drawElements(
              c.TRIANGLES,
              i.length,
              i.length > 256 ? c.UNSIGNED_SHORT : c.UNSIGNED_BYTE,
              0,
            ));
        }),
      0 !== l.data.length)
    ) {
      c.activeTexture(c.TEXTURE1);
      const t = c.createTexture();
      (c.bindTexture(c.TEXTURE_2D, t),
        c.pixelStorei(c.UNPACK_ALIGNMENT, 2),
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE),
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE),
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.NEAREST),
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.NEAREST),
        c.texImage2D(
          c.TEXTURE_2D,
          0,
          c.LUMINANCE_ALPHA,
          l.width,
          l.height,
          0,
          c.LUMINANCE_ALPHA,
          c.UNSIGNED_BYTE,
          l.data,
        ),
        c.pixelStorei(c.UNPACK_ALIGNMENT, 4));
      const e = [u[0], u[3], u[2], u[3], u[0], u[1], u[2], u[1]],
        r = new Float32Array(e);
      (c.enableVertexAttribArray(this.positionAttributeLocation),
        c.bufferData(c.ARRAY_BUFFER, r, c.STATIC_DRAW),
        c.vertexAttribPointer(
          this.positionAttributeLocation,
          2,
          c.FLOAT,
          !1,
          0,
          0,
        ),
        c.enableVertexAttribArray(this.dsmAttributeLocation),
        c.bindBuffer(c.ARRAY_BUFFER, this.dsmBuffer),
        c.bufferData(
          c.ARRAY_BUFFER,
          new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]),
          c.STATIC_DRAW,
        ),
        c.vertexAttribPointer(this.dsmAttributeLocation, 2, c.FLOAT, !1, 0, 0),
        c.uniform4f(this.colorUniformLocation, 1, 1, 1, 1),
        c.uniform1i(this.useDSMUniformLocation, 1),
        c.colorMask(!1, !1, !0, !0),
        c.drawArrays(c.TRIANGLE_STRIP, 0, 4),
        c.deleteTexture(t));
    }
    return (
      c.colorMask(!0, !0, !0, !0),
      c.activeTexture(c.TEXTURE1),
      c.bindTexture(c.TEXTURE_2D, s),
      c.activeTexture(c.TEXTURE2),
      c.bindTexture(c.TEXTURE_2D, h),
      c.uniform1i(this.useDSMUniformLocation, 0),
      e
        .filter((t) => t.highlight)
        .forEach((t) => {
          const {
              buildingHeight: e,
              aPosition: r,
              cuts: i,
              centroid: s,
              highlight: u,
            } = t,
            l = new o(s[0], s[1])
              .subtract(y)
              .unscaleBy(new o(A, b))
              .scaleBy(new o(n, a))
              .floor();
          if (l.x < 0 || l.y < 0 || l.x > n || l.y > a) return;
          const h = l.x / n,
            f = l.y / a,
            d = 5 * e,
            m = Math.floor(d / 255) / 255,
            g = Math.floor(d % 255) / 255;
          ((_ = Math.max(_, e)),
            c.uniform2f(this.centroidUniformLocation, h, f),
            c.uniform4f(this.colorUniformLocation, m, g, m, g),
            c.bufferData(c.ARRAY_BUFFER, r, c.DYNAMIC_DRAW),
            c.vertexAttribPointer(
              this.positionAttributeLocation,
              2,
              c.FLOAT,
              !1,
              0,
              0,
            ),
            c.bufferData(c.ARRAY_BUFFER, r, c.DYNAMIC_DRAW),
            c.vertexAttribPointer(
              this.dsmAttributeLocation,
              2,
              c.FLOAT,
              !1,
              0,
              0,
            ),
            c.bufferData(c.ELEMENT_ARRAY_BUFFER, i, c.DYNAMIC_DRAW),
            c.drawElements(
              c.TRIANGLES,
              i.length,
              i.length > 256 ? c.UNSIGNED_SHORT : c.UNSIGNED_BYTE,
              0,
            ));
        }),
      c.deleteFramebuffer(p),
      { maxHeight: _, heightMapTex: this.targetTexture }
    );
  }
}
const at = (t) => {
  const { tile: e, maxZoom: r, tileSize: o } = t;
  let { x: i, y: n, z: a } = e;
  if (a > r) {
    const t = Math.pow(2, e.z - r);
    ((i = Math.floor(i / t)), (n = Math.floor(n / t)), (a = r));
  }
  return {
    x: 256 === o ? i : Math.floor(i / 2),
    y: 256 === o ? n : Math.floor(n / 2),
    z: 256 === o ? a : a - 1,
  };
};
class st {
  constructor(t) {
    ((this.gl = t),
      (this.program = it({
        vSrc: "\n      attribute vec4 a_tex_position;\n      attribute vec4 a_tile_position;\n      varying vec2 v_tex_pos;\n      void main() {\n        v_tex_pos = a_tex_position.xy;\n        gl_Position = a_tile_position;\n      }\n    ",
        fSrc: "\n    #ifdef GL_FRAGMENT_PRECISION_HIGH\n      precision highp float;\n    #else\n      precision mediump float;\n    #endif\n      uniform sampler2D u_texture;\n      uniform float u_encoding;\n      uniform float u_tile_size;\n      varying vec2 v_tex_pos;\n\n      float getElevationTerrarium(vec4 color) {\n        float decoded = color.r * 255.0 * 256.0 + color.g * 255.0 + color.b * 255.0 / 256.0 - 32768.0;\n        return decoded;\n      }\n\n      float getElevationMapbox(vec4 color) {\n        float decoded = -10000.0 + (color.r * 255.0 * 256.0 * 256.0 + color.g * 255.0 * 256.0 + color.b * 255.0) * .1;\n        return decoded;\n      }\n\n      float getElevationSwitzerland(vec4 color) {\n        float decoded = ((color.r * 255.0 * 256.0 + color.g * 255.0) / pow(2.0, 16.0)) * 4808.0;\n        return decoded;\n      }\n\n      float getElevationCanopy(vec4 color) {\n        float closestDistance = 1000.0;\n        int closestColor = 100;\n        const int colorCount = 26;\n        vec3 colorArray[colorCount];\n\n        colorArray[0] = vec3(51.0 / 255.0, 0, 66.0 / 255.0);\n        colorArray[1] = vec3(51.0 / 255.0, 16.0/255.0, 86.0 / 255.0);\n        colorArray[2] = vec3(51.0 / 255.0, 24.0/255.0, 86.0 / 255.0);\n        colorArray[3] = vec3(51.0 / 255.0, 24.0/255.0, 98.0 / 255.0);\n        colorArray[4] = vec3(51.0 / 255.0, 37.0/255.0, 108.0 / 255.0);\n        colorArray[5] = vec3(48.0 / 255.0, 47.0/255.0, 114.0 / 255.0);\n        colorArray[6] = vec3(44.0 / 255.0, 57.0/255.0, 116.0 / 255.0);\n        colorArray[7] = vec3(42.0 / 255.0, 68.0/255.0, 117.0 / 255.0);\n        colorArray[8] = vec3(39.0 / 255.0, 79.0/255.0, 120.0 / 255.0);\n        colorArray[9] = vec3(37.0 / 255.0, 89.0/255.0, 123.0 / 255.0);\n        colorArray[10] = vec3(34.0 / 255.0, 100.0/255.0, 120.0 / 255.0);\n        colorArray[11] = vec3(34.0 / 255.0, 110.0/255.0, 121.0 / 255.0);\n        colorArray[12] = vec3(30.0 / 255.0, 120.0/255.0, 120.0 / 255.0);\n        colorArray[13] = vec3(32.0 / 255.0, 132.0/255.0, 117.0 / 255.0);\n        colorArray[14] = vec3(36.0 / 255.0, 141.0/255.0, 112.0 / 255.0);\n        colorArray[15] = vec3(40.0 / 255.0, 152.0/255.0, 108.0 / 255.0);\n        colorArray[16] = vec3(44.0 / 255.0, 161.0/255.0, 101.0 / 255.0);\n        colorArray[17] = vec3(52.0 / 255.0, 173.0/255.0, 95.0 / 255.0);\n        colorArray[18] = vec3(69.0 / 255.0, 182.0/255.0, 84.0 / 255.0);\n        colorArray[19] = vec3(88.0 / 255.0, 191.0/255.0, 72.0 / 255.0);\n        colorArray[20] = vec3(109.0 / 255.0, 201.0/255.0, 61.0 / 255.0);\n        colorArray[21] = vec3(130.0 / 255.0, 209.0/255.0, 51.0 / 255.0);\n        colorArray[22] = vec3(158.0 / 255.0, 213.0/255.0, 45.0 / 255.0);\n        colorArray[23] = vec3(189.0 / 255.0, 218.0/255.0, 40.0 / 255.0);\n        colorArray[24] = vec3(219.0 / 255.0, 224.0/255.0, 36.0 / 255.0);\n        colorArray[25] = vec3(252.0 / 255.0, 228.0/255.0, 30.0 / 255.0);\n\n        for (int i = 0; i < colorCount; i++) {\n          float distance = sqrt(pow(color.x - colorArray[i].x, 2.0) + pow(color.y - colorArray[i].y, 2.0) + pow(color.z - colorArray[i].z, 2.0));\n          if (distance < closestDistance) {\n            closestDistance = distance;\n            closestColor = i;\n          }\n        }\n        if (closestColor < 3) {\n          closestColor = 0;\n        }\n\n        return float(closestColor);\n      }\n\n      float getElevation(vec4 color, float encoding) {\n        float decoded;\n        if (encoding == 1.0) {\n          decoded = getElevationMapbox(color);\n        } else if (encoding == 2.0) {\n          decoded = getElevationSwitzerland(color);\n        } else if (encoding == 3.0) {\n          decoded = getElevationCanopy(color);\n        } else {\n          decoded = getElevationTerrarium(color);\n        }\n        float scaled = decoded * 5.0;\n        float elevation = max(scaled, 0.0);\n        return elevation;\n      }\n\n      float textureSampleLinear(sampler2D sampler, vec2 texCoord) {\n        vec2 texelSize = vec2(1.0 / u_tile_size, 1.0 / u_tile_size);\n      \n        // Calculate interpolation weights based on texCoord fract (fractional part)\n        vec2 uv = fract(texCoord * u_tile_size);\n      \n        // Sample four nearest texels\n        vec4 bottomLeft  = texture2D(sampler, texCoord);\n        vec4 bottomRight = texture2D(sampler, texCoord + vec2(texelSize.x, 0.0));\n        vec4 topLeft    = texture2D(sampler, texCoord + vec2(0.0, texelSize.y));\n        vec4 topRight   = texture2D(sampler, texCoord + texelSize);\n\n        float bottomLeftEl = getElevation(bottomLeft, u_encoding);\n        float bottomRightEl = getElevation(bottomRight, u_encoding);\n        float topLeftEl = getElevation(topLeft, u_encoding);\n        float topRightEl = getElevation(topRight, u_encoding);\n      \n        // Interpolate between bottom and top rows\n        float bottom = mix(bottomLeftEl, bottomRightEl, uv.x);\n        float top    = mix(topLeftEl, topRightEl, uv.x);\n      \n        // Interpolate final color\n        return mix(bottom, top, uv.y);\n      }\n\n      void main() {\n        float elevation = textureSampleLinear(u_texture, v_tex_pos);\n        float r = floor(elevation / 255.0) / 255.0;\n        float g = floor(mod(elevation, 255.0)) / 255.0;\n        gl_FragColor = vec4(r, g, r, g);\n\n        // vec4 color = texture2D(u_texture, v_tex_pos);\n        // float elevation = getElevation(color, u_encoding);\n        // float r = floor(elevation / 255.0) / 255.0;\n        // float g = floor(mod(elevation, 255.0)) / 255.0;\n        // gl_FragColor = vec4(0, 0, r, g);\n        // gl_FragColor = color;\n      }\n    ",
        gl: t,
      })),
      t.useProgram(this.program),
      (this.texPositionAttributeLocation = t.getAttribLocation(
        this.program,
        "a_tex_position",
      )),
      (this.tilePositionAttributeLocation = t.getAttribLocation(
        this.program,
        "a_tile_position",
      )),
      (this.encodingUniformLocation = t.getUniformLocation(
        this.program,
        "u_encoding",
      )),
      (this.tileSizeUniformLocation = t.getUniformLocation(
        this.program,
        "u_tile_size",
      )),
      (this.texPositionBuffer = t.createBuffer()),
      t.bindBuffer(t.ARRAY_BUFFER, this.texPositionBuffer),
      t.bufferData(
        t.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        t.STATIC_DRAW,
      ),
      t.enableVertexAttribArray(this.texPositionAttributeLocation),
      t.vertexAttribPointer(
        this.texPositionAttributeLocation,
        2,
        t.FLOAT,
        !1,
        0,
        0,
      ),
      (this.tilePositionBuffer = t.createBuffer()),
      (this.tileTexture = t.createTexture()),
      t.bindTexture(t.TEXTURE_2D, this.tileTexture),
      t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE),
      t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE),
      t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST),
      t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST),
      (this.outputTexture = t.createTexture()),
      (this.inProgress = []),
      (this.finished = 0));
  }
  merge(t, e) {
    return E(this, void 0, void 0, function* () {
      const r = this.gl;
      let o = 0;
      const {
        width: i,
        height: n,
        crossOrigin: a,
        getSourceUrl: s,
        getElevation: u,
        tileSize: l,
        tileLoaded: h,
        maxZoom: c,
      } = e;
      if (r) {
        (this.inProgress.forEach((t) => (t.src = "")),
          (this.inProgress = []),
          (this.finished = 0));
        const e = new Set();
        (t.forEach((t) => {
          e.add(s(at({ tile: t, maxZoom: c, tileSize: l })));
        }),
          r.useProgram(this.program));
        let f = 0;
        (-32768 === u({ r: 0, g: 0, b: 0, a: 0 }) && (f = 0),
          -1e4 === u({ r: 0, g: 0, b: 0, a: 0 }) && (f = 1),
          4808 === u({ r: 256, g: 0, b: 0, a: 0 }) && (f = 2),
          0 === u({ r: 51, g: 0, b: 66, a: 0 }) && (f = 3),
          r.uniform1f(this.encodingUniformLocation, f),
          ot({
            gl: r,
            texture: this.outputTexture,
            imageData: null,
            format: r.RGBA,
            width: i,
            height: n,
            wrap: r.CLAMP_TO_EDGE,
            filter: r.NEAREST,
          }));
        const d = r.createFramebuffer();
        (r.bindFramebuffer(r.FRAMEBUFFER, d),
          r.framebufferTexture2D(
            r.FRAMEBUFFER,
            r.COLOR_ATTACHMENT0,
            r.TEXTURE_2D,
            this.outputTexture,
            0,
          ));
        const m = r.checkFramebufferStatus(r.FRAMEBUFFER);
        (m !== r.FRAMEBUFFER_COMPLETE &&
          console.error("Framebuffer is incomplete: " + m),
          r.clear(r.COLOR_BUFFER_BIT));
        const _ = Array.from(e).map((e) =>
          E(this, void 0, void 0, function* () {
            return new Promise((u, h) => {
              const f = new Image();
              (this.inProgress.push(f),
                (f.onload = () => {
                  (r.useProgram(this.program),
                    r.activeTexture(r.TEXTURE0),
                    r.bindTexture(r.TEXTURE_2D, this.tileTexture),
                    r.texImage2D(
                      r.TEXTURE_2D,
                      0,
                      r.RGBA,
                      r.RGBA,
                      r.UNSIGNED_BYTE,
                      f,
                    ),
                    r.bindFramebuffer(r.FRAMEBUFFER, d));
                  const a = t.filter(
                      (t) => e === s(at({ tile: t, maxZoom: c, tileSize: l })),
                    ),
                    h = a.reduce((t, e) => Math.min(t, e.xOffset), 1 / 0),
                    m = a.reduce((t, e) => Math.min(t, e.yOffset), 1 / 0),
                    _ = a.reduce((t, e) => Math.max(t, e.xOffset), 0),
                    g = a.reduce((t, e) => Math.max(t, e.yOffset), 0),
                    x = a.reduce((t, e) => Math.min(t, e.x), 1 / 0),
                    p = a.reduce((t, e) => Math.min(t, e.y), 1 / 0),
                    E = a.reduce((t, e) => Math.max(t, e.x), 0),
                    v = a.reduce((t, e) => Math.max(t, e.y), 0),
                    T = a[0].z,
                    y = h / i,
                    A = m / n,
                    b = (_ + 256) / i,
                    R = (g + 256) / n,
                    M = [y, A, b, A, y, R, b, R].map((t) => 2 * t - 1);
                  (r.bindBuffer(r.ARRAY_BUFFER, this.tilePositionBuffer),
                    r.bufferData(
                      r.ARRAY_BUFFER,
                      new Float32Array(M),
                      r.STATIC_DRAW,
                    ),
                    r.enableVertexAttribArray(
                      this.tilePositionAttributeLocation,
                    ),
                    r.vertexAttribPointer(
                      this.tilePositionAttributeLocation,
                      2,
                      r.FLOAT,
                      !1,
                      0,
                      0,
                    ));
                  let w = [0, 0, 1, 0, 0, 1, 1, 1];
                  const F = Math.pow(
                      2,
                      Math.max(0, T - c) + (256 !== l ? 1 : 0),
                    ),
                    D = 514 === l ? 1 / l : 0,
                    L = 1 / F,
                    U = (x % F) / F,
                    S = (p % F) / F,
                    C = (E % F) / F,
                    P = (v % F) / F;
                  ((w = [U, S, C + L, S, U, P + L, C + L, P + L].map(
                    (t) => t * (514 === l ? 512 / 514 : 1) + D,
                  )),
                    r.bindBuffer(r.ARRAY_BUFFER, this.texPositionBuffer),
                    r.bufferData(
                      r.ARRAY_BUFFER,
                      new Float32Array(w),
                      r.STATIC_DRAW,
                    ),
                    r.enableVertexAttribArray(
                      this.texPositionAttributeLocation,
                    ),
                    r.vertexAttribPointer(
                      this.texPositionAttributeLocation,
                      2,
                      r.FLOAT,
                      !1,
                      0,
                      0,
                    ),
                    r.uniform1f(this.tileSizeUniformLocation, l),
                    r.viewport(0, 0, i, n),
                    r.disable(r.BLEND),
                    r.drawArrays(r.TRIANGLE_STRIP, 0, 4));
                  const I = Math.floor(y * i),
                    B = Math.floor(A * n),
                    N = Math.ceil((b - y) * i),
                    O = Math.ceil((R - A) * n),
                    X = new Uint8Array(4 * N * O);
                  r.readPixels(I, B, N, O, r.RGBA, r.UNSIGNED_BYTE, X);
                  for (let t = 0; t < X.length; t += 4) {
                    const e = (256 * X[t + 2] + X[t + 3]) / 5;
                    o = Math.max(e, o);
                  }
                  u(null);
                }),
                (f.onerror = (t) => {
                  if (f.src !== f.originalSource)
                    return h("new tiles requested");
                  u(null);
                }),
                (f.crossOrigin = a || null),
                (f.src = e),
                (f.originalSource = f.src));
            }).then(() => {
              (this.finished++, h(this.finished, this.inProgress.length));
            });
          }),
        );
        try {
          yield Promise.all(_);
        } catch (t) {
          return (console.log(`${_.length} requests aborted`, t), null);
        }
        return (
          (this.inProgress = []),
          (this.outputTexture.maxHeight = o),
          r.deleteFramebuffer(d),
          this.outputTexture
        );
      }
      throw new Error("Could not get canvas context for merging tile images");
    });
  }
}
class ut extends class extends class {
  constructor() {
    this.events = {};
  }
  on(t, e) {
    return (
      "object" != typeof this.events[t] && (this.events[t] = []),
      this.events[t].push(e),
      () => this.removeListener(t, e)
    );
  }
  removeListener(t, e) {
    if ("object" != typeof this.events[t]) return;
    const r = this.events[t].indexOf(e);
    r > -1 && this.events[t].splice(r, 1);
  }
  removeAllListeners() {
    Object.keys(this.events).forEach((t) =>
      this.events[t].splice(0, this.events[t].length),
    );
  }
  emit(t, ...e) {
    "object" == typeof this.events[t] &&
      [...this.events[t]].forEach((t) => t.apply(this, e));
  }
  once(t, e) {
    const r = this.on(t, (...t) => {
      (r(), e.apply(this, t));
    });
    return r;
  }
} {
  constructor(...t) {
    (super(),
      (this.options = {
        date: new Date(),
        color: "000",
        opacity: 0.3,
        sunExposure: {
          enabled: !1,
          startDate: new Date(),
          endDate: new Date(),
          iterations: 32,
        },
        apiKey: "",
        terrainSource: {
          maxZoom: 15,
          tileSize: 256,
          _overzoom: 15,
          getSourceUrl: (t) =>
            "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/7/17/45.png",
          getElevation: (t) => {
            const { r: e, g: r, b: o } = t;
            return 256 * e + r + o / 256 - 32768;
          },
        },
        canopySource: void 0,
        dsmSource: {
          bounds: [
            { lat: 0, lng: 0 },
            { lat: 0, lng: 0 },
          ],
          data: new Uint8ClampedArray(),
          width: 0,
          height: 0,
          maxHeight: 0,
        },
        belowCanopy: !1,
        getFeatures: () => Promise.resolve([]),
        getSize: () => ({ width: Number.NaN, height: Number.NaN }),
        debug: (t) => {},
      }));
    const e = t[0];
    if (((this.options = Object.assign(this.options, e)), !this.options.apiKey))
      throw new Error("Could not load ShadeMap: apiKey missing");
    (fetch("https://shademap.app/sdk/load", {
      method: "POST",
      body: JSON.stringify({ api_key: this.options.apiKey }),
      headers: { "Content-Type": "application/json" },
    })
      .then((t) =>
        E(this, void 0, void 0, function* () {
          if (200 !== t.status) throw new Error(yield t.text());
        }),
      )
      .catch((t) =>
        E(this, void 0, void 0, function* () {
          throw new Error(
            `Could not load ShadeMap API. Key: ${this.options.apiKey} Error: ${t}`,
          );
        }),
      ),
      (this._canvas = document.createElement("canvas")),
      (this._color = this._parseColor(this.options.color)),
      (this._reset = this._reset.bind(this)),
      (this._draw = this._draw.bind(this)));
  }
  onRemove() {
    return (this._map && this._map.off("moveend", this._reset), this);
  }
  setDate(t) {
    return (
      this.options.date.getTime() !== t.getTime()
        ? ((this.options.date = t),
          this._compiledKernel &&
            (Q(this._compiledKernel, { date: this.options.date }),
            this._heightMap && this._flush()))
        : this.emit("idle"),
      this
    );
  }
  _setDateForTimezone(t, e) {
    let r = 0;
    (e && (r = x(this.options.date) - x(this.options.date, e)),
      this.setDate(new Date(t.getTime() - r)));
  }
  setColor(t) {
    return (
      this.options.color !== t &&
        ((this.options.color = t),
        (this._color = this._parseColor(this.options.color)),
        this._compiledKernel &&
          (et(this._compiledKernel, {
            color: this._color,
            opacity: this.options.opacity,
          }),
          this._flush())),
      this
    );
  }
  setOpacity(t) {
    return (
      this.options.opacity !== t &&
        ((this.options.opacity = t),
        this._compiledKernel &&
          (et(this._compiledKernel, {
            color: this._color,
            opacity: this.options.opacity,
          }),
          this._flush())),
      this
    );
  }
  setBelowCanopy(t) {
    return (
      (this.options.belowCanopy = t),
      this._heightMap ? this._draw(this._heightMap) : this._reset(),
      this
    );
  }
  setTerrainSource(t) {
    return (
      (this.options.terrainSource = t),
      delete this._heightMap,
      this._reset(),
      this
    );
  }
  setCanopySource(t) {
    return (
      (this.options.canopySource = t),
      delete this._heightMap,
      this._reset(),
      this
    );
  }
  setDSMSource(t) {
    return (
      (this.options.dsmSource = t),
      delete this._heightMap,
      this._reset(),
      this
    );
  }
  setSunExposure(t = !1, e) {
    return E(this, void 0, void 0, function* () {
      if (
        ((this.options.sunExposure = Object.assign(
          Object.assign({}, this.options.sunExposure),
          { enabled: t },
        )),
        e)
      ) {
        const {
          startDate: r = new Date(),
          endDate: o = new Date(),
          iterations: i = 32,
        } = e;
        this.options.sunExposure = {
          enabled: t,
          startDate: r,
          endDate: o,
          iterations: i,
        };
      }
      if (this._map && this._compiledKernel && this._heightMap) {
        if (!1 === t) Q(this._compiledKernel, { date: this.options.date });
        else {
          const {
            startDate: t,
            endDate: e,
            iterations: r,
          } = this.options.sunExposure;
          if (!(t instanceof Date && e instanceof Date))
            throw new Error("Start date or end date or both are missing");
          if (e.getTime() < t.getTime())
            throw new Error(
              "End date must come after the start date to calculate sun exposure",
            );
          if (
            !0 ===
            (yield tt(this._compiledKernel, {
              startDate: t,
              endDate: e,
              iterations: r,
              emit: this.emit.bind(this),
            }))
          )
            return this;
        }
        this._flush();
      }
      return this;
    });
  }
  _lngLatToTextureCoords(t) {
    if (this._heightMap) {
      const {
          DEMPixelBounds: e,
          demZoom: r,
          width: o,
          height: i,
        } = this._heightMap,
        n = e.min;
      return t.map((t) => {
        const e = K(t, r);
        return [(e.x - n.x) / o, (e.y - n.y) / i];
      });
    }
    return [];
  }
  _getBounds(t, e) {
    const { width: r, height: i } = this.options.getSize();
    if (Number.isNaN(r) || Number.isNaN(i)) return t.getBounds();
    const n = t.getCenter(),
      a = K(n, e),
      s = k(new o(a.x - r / 2, a.y - i / 2), e),
      u = k(new o(a.x + r / 2, a.y + i / 2), e);
    return t.createBounds({ nw: s, se: u });
  }
  _getDEMZoom(t) {
    const e = Math.min(
      this.options.terrainSource._overzoom ||
        this.options.terrainSource.maxZoom,
      t.getZoom(),
    );
    return Math.round(e);
  }
  _reset() {
    return E(this, void 0, void 0, function* () {
      if ((this.options.debug("_reset()"), this._map)) {
        const t = p(this._map);
        let e = this._getDEMZoom(t);
        try {
          this._bounds = this._getBounds(t, e);
        } catch (t) {
          return (console.error("Invalid bounds returned: ", t), this);
        }
        try {
          if (!t.isLeaflet() && this._map.getPitch() > 45) {
            yield new Promise((t) => {
              this._map.loaded()
                ? t(!0)
                : this._map.once("idle", function () {
                    t(!0);
                  });
            });
            const r = this._map.style._sourceCaches["other:composite"]
                .getVisibleCoordinates()
                .reverse(),
              i = r.reduce(
                (t, e) => Math.max(t, e.canonical.z),
                Number.MIN_SAFE_INTEGER,
              ),
              n = r.filter((t) => t.canonical.z === i).map((t) => t.canonical),
              [a, s, u, l] = n.reduce(
                (t, e) => [
                  Math.min(t[0], e.x),
                  Math.min(t[1], e.y),
                  Math.max(t[2], e.x),
                  Math.max(t[3], e.y),
                ],
                [
                  Number.MAX_SAFE_INTEGER,
                  Number.MAX_SAFE_INTEGER,
                  Number.MIN_SAFE_INTEGER,
                  Number.MIN_SAFE_INTEGER,
                ],
              ),
              h = k(new o(512 * a, 512 * s), i + 1),
              c = k(new o(512 * (u + 1), 512 * (l + 1)), i + 1);
            ((e = i + 1), (this._bounds = t.createBounds({ nw: h, se: c })));
          }
        } catch (t) {
          console.log("Mapbox tile optimization failed", t);
        }
        const r = yield $({
          gl: this._gl,
          demZoom: e,
          bounds: this._bounds,
          terrainSource: this.options.terrainSource,
          canopySource: this.options.canopySource,
          dsmSource: this.options.dsmSource,
          getFeatures: this.options.getFeatures,
          buildingRasterizer: this._buildingRasterizer,
          tileMerger: this._tileMerger,
          canopyMerger: this._canopyMerger,
          tileLoaded: (t, e) => this.emit("tileloaded", t, e),
          forceUpdate: !this._heightMap,
        });
        ((this._heightMap = r), r.dirty && (yield this._draw(r)));
      }
      return this;
    });
  }
  _draw(t) {
    return E(this, void 0, void 0, function* () {
      if (
        (this.options.debug("_draw()"),
        this._canvas && this._compiledKernel && this._map)
      ) {
        if (
          (rt({
            kernel: this._compiledKernel,
            map: p(this._map),
            heightMap: t,
            color: this._color,
            belowCanopy: this.options.belowCanopy,
            opacity: this.options.opacity,
            now: this.options.date,
            maxZoom: this.options.terrainSource.maxZoom,
            skipRender: this.options.sunExposure.enabled,
          }),
          this.options.sunExposure.enabled)
        ) {
          const {
            startDate: t,
            endDate: e,
            iterations: r,
          } = this.options.sunExposure;
          if (
            !0 ===
            (yield tt(this._compiledKernel, {
              startDate: t,
              endDate: e,
              iterations: r,
              emit: this.emit.bind(this),
            }))
          )
            return this;
        }
        this._bounds && this._repositionCanvas(this._bounds);
      }
      return this;
    });
  }
  readPixel(t, e) {
    const r = new Uint8Array(4);
    return (
      this._gl &&
        this._gl.readPixels(
          t,
          e,
          1,
          1,
          this._gl.RGBA,
          this._gl.UNSIGNED_BYTE,
          r,
        ),
      r
    );
  }
  readPixels(t, e, r, o) {
    const i = new Uint8Array(r * o * 4);
    return (
      this._gl &&
        this._gl.readPixels(
          t,
          e,
          r,
          o,
          this._gl.RGBA,
          this._gl.UNSIGNED_BYTE,
          i,
        ),
      i
    );
  }
  toGeoTiff() {
    const t = (t, e) => {
      const r = this.readPixels(0, 0, t, e),
        o = t * e * 1,
        i = 1 * t,
        n = (e - 1) * i,
        a = new Uint8Array(o),
        s = new Uint8Array(o);
      let u = 0;
      const { startDate: l, endDate: h } = this.options.sunExposure;
      this.options.sunExposure.enabled &&
        l &&
        h &&
        (u = h.getTime() - l.getTime());
      for (let t = 0; t < r.length; t += 4) {
        let e;
        if (this.options.sunExposure.enabled) {
          const o = r.subarray(t, t + 3),
            i = g(o, 0.5, u) / 1e3 / 60,
            n = Math.min(Math.floor(i / 6), 255);
          e = new Uint8Array([n]);
        } else {
          e =
            r[t] + r[t + 1] + r[t + 2] === 0
              ? new Uint8Array([255])
              : new Uint8Array([0]);
        }
        a.set(e, (t / 4) * 1);
      }
      if (this._map && !p(this._map).isLeaflet()) return a;
      for (let t = 0; t < o; t += i) s.set(a.subarray(t, t + i), n - t);
      return s;
    };
    if (this._map && this._heightMap) {
      const e = this._heightMap.outputWidth,
        r = this._heightMap.outputHeight,
        o = t(e, r),
        i = p(this._map),
        { lat: n, lng: a } = i.getBounds().getNorthWest(),
        s = i.getBounds().getSouthEast(),
        u = [0, 0, 0, a, n, 0],
        l = [(s.lng - a) / e, (n - s.lat) / r, 0];
      return (
        this.options.sunExposure.enabled,
        {
          data: o,
          metadata: {
            width: e,
            height: r,
            ModelTiepoint: u,
            ModelPixelScale: l,
            GeographicTypeGeoKey: 4326,
            GeogCitationGeoKey: "WGS 84",
          },
        }
      );
    }
    return null;
  }
  _generateShadeProfile(t) {
    if (this._compiledKernel) {
      const e = this._lngLatToTextureCoords(t.locations);
      return ((t, e) => {
        const r = J(
            { r: e.sunColor[0], g: e.sunColor[1], b: e.sunColor[2] },
            1,
          ),
          o = J(
            { r: e.shadeColor[0], g: e.shadeColor[1], b: e.shadeColor[2] },
            1,
          );
        return t.generateShadeProfile(
          Object.assign(Object.assign({}, e), { sunColor: r, shadeColor: o }),
        );
      })(
        this._compiledKernel,
        Object.assign(Object.assign({}, t), { texCoords: e }),
      );
    }
    return new Uint8Array();
  }
  _generateLocationShadeProfile(t) {
    if (this._compiledKernel) {
      const e = x(t.startDate) - x(t.startDate, t.tzId),
        r = t.startDate.getTime() - e,
        o = t.endDate.getTime() - e,
        i = this._lngLatToTextureCoords([t.location])[0],
        {
          output: n,
          outputWidth: a,
          outputHeight: s,
        } = ((t, e) => {
          const r = J(
              { r: e.sunColor[0], g: e.sunColor[1], b: e.sunColor[2] },
              1,
            ),
            o = J(
              { r: e.shadeColor[0], g: e.shadeColor[1], b: e.shadeColor[2] },
              1,
            );
          return t.generateLocationShadeProfile(
            Object.assign(Object.assign({}, e), { sunColor: r, shadeColor: o }),
          );
        })(
          this._compiledKernel,
          Object.assign(Object.assign({}, t), {
            startTime: r,
            endTime: o,
            texCoord: i,
          }),
        );
      return (
        (n.toArray = function () {
          const e = new Array();
          for (let r = 0; r < a; r++) {
            const o = [];
            for (let e = s - 1; e >= 0; e--) {
              const i = e * a * 4 + 4 * r,
                n = this.slice(i, i + 4);
              o.push(n.join("") === t.sunColor.join("") ? 1 : 0);
            }
            e.push(o);
          }
          return e;
        }),
        { data: n, width: a, height: s }
      );
    }
    return { data: new Uint8Array(), width: 0, height: 0 };
  }
  getHoursOfSun(t, e) {
    if (this.options.sunExposure.enabled) {
      const r = this.readPixel(t, e),
        { startDate: o, endDate: i } = this.options.sunExposure,
        n = i.getTime() - o.getTime(),
        a = g(r, 0.5, n);
      return Math.abs(a / 1e3 / 3600);
    }
    return 0;
  }
  _repositionCanvas(t) {}
  _flush() {}
  flushSync() {
    this._gl && this._gl.finish();
  }
  _parseColor(t) {
    t = t.replace("#", "");
    const e = { r: 0, g: 0, b: 0 };
    return (
      /^([0-9A-F]{3}){1,2}$/i.test(t) &&
        (3 === t.length
          ? ((e.r = parseInt(t[0] + t[0], 16)),
            (e.g = parseInt(t[1] + t[1], 16)),
            (e.b = parseInt(t[2] + t[2], 16)))
          : 6 === t.length &&
            ((e.r = parseInt(t[0] + t[1], 16)),
            (e.g = parseInt(t[2] + t[3], 16)),
            (e.b = parseInt(t[4] + t[5], 16)))),
      e
    );
  }
} {
  constructor(t) {
    (super(t),
      (this.id = "shademap-layer"),
      (this.type = "custom"),
      (this.canvasSourceId = "canvas-source"),
      (this.attributionSourceId = "attribution-source"),
      (this.canvasLayerId = "canvas-layer"),
      (this.attributionLayerId = "attribution-layer"),
      (this._refreshing = 0),
      (this._raf = 0),
      (this.id = this.id + _()),
      (this.canvasSourceId = this.canvasSourceId + _()),
      (this.attributionSourceId = this.attributionSourceId + _()),
      (this.canvasLayerId = this.canvasLayerId + _()),
      (this.attributionLayerId = this.attributionLayerId + _()),
      this.options.terrainSource.tileSize > 256 &&
        (this.options.terrainSource.maxZoom =
          this.options.terrainSource.maxZoom + 1),
      (this._moveEndHandler = () => {
        this._map && this._reset();
      }));
  }
  render(t, e) {}
  addTo(t) {
    return (t.addLayer(this), this);
  }
  onAdd(t) {
    ((this._map = t),
      (this._gl = this._map.painter.context.gl),
      (this._framebuffer = this._gl.createFramebuffer()));
    ((this._compiledKernel = (function (t) {
      const { context: e, setRenderBuffer: r } = t,
        o = e,
        i = it({
          gl: o,
          vSrc: "precision lowp float;precision lowp int;precision lowp sampler2D;attribute vec2 a_pos;attribute vec2 a_tex_pos;varying vec2 vTexCoordCropped;varying vec2 vTexCoordFull;void main(void){gl_Position=vec4(a_pos,0,1);vTexCoordFull=(gl_Position*0.5+0.5).xy;vTexCoordCropped=a_tex_pos;}",
          fSrc: "#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nprecision lowp int;precision lowp sampler2D;float atan2(float v1,float v2){if(v1==0.0||v2==0.0)return 0.0;return atan(v1,v2);}float _pow(float v1,float v2){if(v2==0.0)return 1.0;return pow(v1,v2);}float integerMod(float x,float y){float res=floor(mod(x,y));return res*(res>floor(y)-1.0 ? 0.0 : 1.0);}float divWithIntCheck(float x,float y){if(floor(x)==x&&floor(y)==y&&integerMod(x,y)==0.0){return float(int(x)/int(y));}return x/y;}float integerCorrectionModulo(float number,float divisor){if(number<0.0){number=abs(number);if(divisor<0.0){divisor=abs(divisor);}return-(number-(divisor*floor(divWithIntCheck(number,divisor))));}if(divisor<0.0){divisor=abs(divisor);}return number-(divisor*floor(divWithIntCheck(number,divisor)));}float getDEMElevationFromSampler2D(sampler2D tex,float x,float y){vec4 result=texture2D(tex,vec2(x,y));return(result.r*255.0*256.0+result.g*255.0)/5000.0;}float getDSMElevationFromSampler2D(sampler2D tex,float x,float y){vec4 result=texture2D(tex,vec2(x,y));return(result.b*255.0*256.0+result.a*255.0)/5000.0;}vec4 actualColor;void color(float r,float g,float b,float a){actualColor=vec4(r,g,b,a);}void color(float r,float g,float b){color(r,g,b,1.0);}void color(float r){color(r,r,r,1.0);}void color(vec4 color){actualColor=color;}const int LOOP_MAX=1000;varying vec2 vTexCoordCropped;varying vec2 vTexCoordFull;uniform sampler2D user_a;uniform float user_width;uniform float user_height;uniform float user_maxHeight;uniform float user_zoom;uniform float user_topYCoord;uniform float user_ySize;uniform vec4 user_color;uniform vec4 u_sunColor;uniform float user_step;uniform float user_west;uniform float user_dLng;uniform float user_dec;uniform float user_Hi;uniform bool u_below_canopy;uniform sampler2D user_sunExposureTexture;uniform bool user_outputSunExposure;uniform bool u_outputShadeProfile;uniform sampler2D u_decHiTexture;uniform sampler2D u_gpxTexture;uniform bool u_outputLocationShadeProfile;uniform vec2 u_shadeProfileLocation;float kernelResult;void kernel(){float sunDec=user_dec;float sunHi=user_Hi;vec4 shade_color=user_color;float maxHeight=user_maxHeight/1000.0;float user_x=vTexCoordCropped.x;float user_y=vTexCoordCropped.y;if(u_outputShadeProfile==true){vec4 decHi=texture2D(u_decHiTexture,vec2(vTexCoordFull.x,1.0-vTexCoordFull.y));sunDec=-decHi.r;sunHi=decHi.g*10.0;vec4 gpx=texture2D(u_gpxTexture,vec2(vTexCoordFull.x,.5));user_x=gpx.x;user_y=gpx.y;}if(u_outputLocationShadeProfile==true){vec4 decHi=texture2D(u_decHiTexture,vec2(vTexCoordFull.x,1.0-vTexCoordFull.y));sunDec=-decHi.r;sunHi=decHi.g*10.0;user_x=u_shadeProfileLocation.x;user_y=u_shadeProfileLocation.y;}float user_lit=1.0;float dsm_height=getDSMElevationFromSampler2D(user_a,user_x,user_y);if(u_below_canopy==true){float dem_height=getDEMElevationFromSampler2D(user_a,user_x,user_y);if(dsm_height-dem_height>.002){user_lit=0.0;}}float user_z=dsm_height;float user_PI=3.141592653589793;float user_2PI=6.283185307179586;float earthRadiusInKm=6378.137;float user_deg=57.29577951308232;float user_y_coord=user_topYCoord+(user_y*user_ySize);float user_lat_coord=(user_y_coord-0.5)/-0.15915494309189532;float user_lat=(2.0*atan(exp(user_lat_coord)))-(user_PI/2.0);float user_rad=0.017453292519943295;float user_lng=user_west+(user_dLng*user_x);float user_H=integerCorrectionModulo((sunHi-(user_rad*-user_lng)),user_2PI);float sun_azimuth=atan2(sin(user_H),((cos(user_H)*sin(user_lat))-(tan(sunDec)*cos(user_lat))));float sun_altitude=asin(((sin(user_lat)*sin(sunDec))+((cos(user_lat)*cos(sunDec))*cos(user_H))));float user_zoom_factor=_pow(2.0,user_zoom);float user_kmPerPixel=divWithIntCheck(156.5430339296875,user_zoom_factor)*abs(cos(user_lat));float user_dx=((-sin(sun_azimuth)*cos(sun_altitude))*user_step)/user_width;float user_dy=((cos(sun_azimuth)*cos(sun_altitude))*user_step)/user_height;float user_dz=((sin(sun_altitude)*user_kmPerPixel)*user_step);float shadow_bias=0.0005;float user_curvature=0.0;float cur_height=0.0;float user_distance=0.0;float user_startX=user_x;float user_startY=user_y;user_x+=user_dx;user_y+=user_dy;user_z+=user_dz;if((abs(1.0)<0.0)){kernelResult=0.0;return;}float minAngle=asin((earthRadiusInKm/(earthRadiusInKm+user_z)))-(user_PI/2.0);if(user_z<0.0||sun_altitude<minAngle){user_lit=0.0;}else{float xIter=ceil(user_dx<0.0 ? abs(user_x/user_dx):(1.0-user_x)/user_dx);float yIter=ceil(user_dy<0.0 ? abs(user_y/user_dy):(1.0-user_y)/user_dy);float zIter=ceil(user_dz<0.0 ? float(LOOP_MAX):(maxHeight-user_z)/user_dz);int iter=int(min(xIter,min(yIter,zIter)));float user_distance=(sqrt(pow(user_dx*user_width,2.0)+pow(user_dy*user_height,2.0))*user_kmPerPixel)/earthRadiusInKm;for(int safeI=0;safeI<LOOP_MAX;safeI++){if(safeI>iter){break;}cur_height=getDSMElevationFromSampler2D(user_a,user_x,user_y);if(cur_height-user_z>shadow_bias){user_curvature=earthRadiusInKm*(1.0-cos(user_distance*float(safeI+1)));if(user_z<(cur_height-user_curvature)){user_lit=0.0;vec4 result=texture2D(user_a,vec2(user_x,user_y));iter=0;break;}}user_x+=user_dx;user_y+=user_dy;user_z+=user_dz;}}if((user_lit==1.0)){if(u_outputLocationShadeProfile==true&&u_sunColor==shade_color){float timeInSun=pow(.7,pow(sin(sun_altitude),.678))*sin(sun_altitude)*(1.0/0.7);float h=0.5;vec4 blue=vec4(0.0,0.0,1.0,1.0);vec4 green=vec4(0.0,1.0,0.0,1.0);vec4 red=vec4(1.0,0.0,0.0,1.0);vec4 col=mix(mix(blue,green,timeInSun/h),mix(green,red,(timeInSun-h)/(1.0-h)),step(h,timeInSun));color(col.r,col.g,col.b,1.0);}else{color(u_sunColor);}}else{color(shade_color);}if(user_outputSunExposure){vec4 aggregateColor=texture2D(user_sunExposureTexture,vec2(vTexCoordFull.x,vTexCoordFull.y));float timeInSun=1.0-aggregateColor.r;float h=0.5;vec4 blue=vec4(0.0,0.0,1.0,1.0);vec4 green=vec4(0.0,1.0,0.0,1.0);vec4 red=vec4(1.0,0.0,0.0,1.0);vec4 col=mix(mix(blue,green,timeInSun/h),mix(green,red,(timeInSun-h)/(1.0-h)),step(h,timeInSun));color(col.r,col.g,col.b,0.5);}}void main(void){kernel();gl_FragColor=actualColor;}",
        });
      o.useProgram(i);
      const n = o.createBuffer(),
        a = o.getAttribLocation(i, "a_pos"),
        s = o.createBuffer(),
        u = o.getAttribLocation(i, "a_tex_pos"),
        l = o.createBuffer();
      (o.bindBuffer(o.ARRAY_BUFFER, l),
        o.bufferData(
          o.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
          o.STATIC_DRAW,
        ));
      const h = o.createBuffer();
      (o.bindBuffer(o.ARRAY_BUFFER, h),
        o.bufferData(
          o.ARRAY_BUFFER,
          new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
          o.STATIC_DRAW,
        ));
      const c = o.getUniformLocation(i, "user_a");
      o.uniform1i(c, 0);
      const f = o.getUniformLocation(i, "user_width"),
        _ = o.getUniformLocation(i, "user_height"),
        g = o.getUniformLocation(i, "user_maxHeight"),
        p = o.getUniformLocation(i, "user_zoom"),
        v = o.getUniformLocation(i, "user_topYCoord"),
        T = o.getUniformLocation(i, "user_ySize"),
        y = o.getUniformLocation(i, "user_step"),
        A = o.getUniformLocation(i, "user_west"),
        b = o.getUniformLocation(i, "user_dLng"),
        R = o.getUniformLocation(i, "user_dec"),
        M = o.getUniformLocation(i, "user_Hi"),
        w = o.getUniformLocation(i, "user_color"),
        F = o.getUniformLocation(i, "u_below_canopy"),
        D = o.getUniformLocation(i, "user_sunExposureTexture"),
        L = o.getUniformLocation(i, "user_outputSunExposure"),
        U = o.getUniformLocation(i, "u_outputShadeProfile"),
        S = o.getUniformLocation(i, "u_gpxTexture"),
        C = o.getUniformLocation(i, "u_decHiTexture"),
        P = o.getUniformLocation(i, "u_sunColor"),
        I = o.getUniformLocation(i, "u_outputLocationShadeProfile"),
        B = o.getUniformLocation(i, "u_shadeProfileLocation"),
        N = o.createTexture();
      let O = 0,
        X = 0,
        z = 0,
        G = null;
      const H = () => {
        X &&
          z &&
          (o.useProgram(i),
          o.bindBuffer(o.ARRAY_BUFFER, n),
          o.enableVertexAttribArray(a),
          o.vertexAttribPointer(a, 2, o.FLOAT, !1, 0, 0),
          o.bindBuffer(o.ARRAY_BUFFER, s),
          o.enableVertexAttribArray(u),
          o.vertexAttribPointer(u, 2, o.FLOAT, !1, 0, 0),
          null !== G &&
            (o.activeTexture(o.TEXTURE0), o.bindTexture(o.TEXTURE_2D, G)),
          r(o, X, z),
          o.viewport(0, 0, X, z),
          o.clear(o.COLOR_BUFFER_BIT),
          o.drawArrays(o.TRIANGLE_STRIP, 0, 4));
      };
      let W = 0,
        j = 0,
        Y = 0,
        Z = "";
      const K = (t) => {
        const e = (t.endTime - t.startTime) / 86400 / 1e3,
          r = 1440;
        if (
          (o.activeTexture(o.TEXTURE3),
          o.uniform1i(C, 3),
          t.startTime !== j || t.endTime !== Y || t.tzId !== Z)
        ) {
          ((j = t.startTime), (Y = t.endTime), (Z = t.tzId));
          const i = [],
            n = 828e5,
            a = x(new Date(j), Z);
          for (let t = 0; t < e; t++) {
            const e = x(new Date(j + 86400 * t * 1e3 + n), Z) - a;
            i[t] = e;
          }
          const s = new Float32Array(r * e * 2);
          for (let t = 0; t < r; t++)
            for (let r = 0; r < e; r++) {
              const o = j + 86400 * r * 1e3 + 60 * t * 1e3,
                { dec: n, Hi: a } = m(o + i[r]);
              ((s[2 * (t * e + r)] = -n), (s[2 * (t * e + r) + 1] = a / 10));
            }
          ot({
            gl: o,
            texture: N,
            imageData: s,
            width: e,
            height: r,
            wrap: o.CLAMP_TO_EDGE,
            filter: o.NEAREST,
            format: o.RG,
            internalFormat: o.RG32F,
            type: o.FLOAT,
          });
        } else o.bindTexture(o.TEXTURE_2D, N);
        return { outputWidth: e, outputHeight: r };
      };
      return {
        updateHeightMap: function (t) {
          const {
            heightMapTex: e,
            width: r,
            height: a,
            maxHeight: u,
            heightMapZoom: l,
            topYCoord: h,
            ySize: c,
            colorVec: d,
            step: m,
            west: x,
            dLng: E,
            dec: D,
            Hi: L,
            cornerClipCoords: U,
            cornerTextureCoords: S,
            outputWidth: C,
            outputHeight: P,
            belowCanopy: I,
            skipRender: B,
          } = t;
          (o.useProgram(i),
            (X = C),
            (z = P),
            (G = e),
            o.bindBuffer(o.ARRAY_BUFFER, n),
            o.bufferData(o.ARRAY_BUFFER, new Float32Array(U), o.STATIC_DRAW),
            o.bindBuffer(o.ARRAY_BUFFER, s),
            o.bufferData(o.ARRAY_BUFFER, new Float32Array(S), o.STATIC_DRAW),
            o.uniform1f(f, r),
            o.uniform1f(_, a),
            o.uniform1f(g, u),
            o.uniform1f(p, l),
            o.uniform1f(v, h),
            o.uniform1f(T, c),
            o.uniform4fv(w, d),
            o.uniform1f(y, m),
            o.uniform1f(A, x),
            o.uniform1f(b, E),
            o.uniform1f(R, D),
            o.uniform1f(M, L),
            o.uniform1f(F, I ? 1 : 0),
            B ||
              (window.cancelAnimationFrame(O),
              (O = window.requestAnimationFrame(H))));
        },
        updateDate: (t) => {
          const { dec: e, Hi: r } = t;
          (o.useProgram(i),
            o.uniform1f(R, e),
            o.uniform1f(M, r),
            window.cancelAnimationFrame(O),
            (O = window.requestAnimationFrame(H)));
        },
        updateDateRange: (t) =>
          E(this, void 0, void 0, function* () {
            const { startDate: e, endDate: r, iterations: l, emit: h } = t;
            o.useProgram(i);
            const c = (W = Date.now()),
              f = Math.floor((r.getTime() - e.getTime()) / l),
              m = o.getUniform(i, w),
              _ = X,
              g = z,
              x = o.createTexture();
            (o.activeTexture(o.TEXTURE2),
              o.bindTexture(o.TEXTURE_2D, x),
              o.texImage2D(
                o.TEXTURE_2D,
                0,
                o.RGBA,
                _,
                g,
                0,
                o.RGBA,
                o.UNSIGNED_BYTE,
                null,
              ),
              o.texParameteri(o.TEXTURE_2D, o.TEXTURE_WRAP_S, o.CLAMP_TO_EDGE),
              o.texParameteri(o.TEXTURE_2D, o.TEXTURE_WRAP_T, o.CLAMP_TO_EDGE),
              o.texParameteri(o.TEXTURE_2D, o.TEXTURE_MIN_FILTER, o.NEAREST),
              o.texParameteri(o.TEXTURE_2D, o.TEXTURE_MAG_FILTER, o.NEAREST));
            const p = o.createFramebuffer();
            o.bindFramebuffer(o.FRAMEBUFFER, p);
            const E = o.COLOR_ATTACHMENT0;
            o.framebufferTexture2D(o.FRAMEBUFFER, E, o.TEXTURE_2D, x, 0);
            for (let t = 0; t < l; t++) {
              if ((o.useProgram(i), h("tileloaded", t, l - 1), c !== W))
                return (
                  o.deleteFramebuffer(p),
                  o.deleteTexture(x),
                  o.uniform4fv(w, m),
                  !0
                );
              yield new Promise((r, h) => {
                window.requestAnimationFrame(() => {
                  (o.useProgram(i),
                    null !== G &&
                      (o.activeTexture(o.TEXTURE0),
                      o.bindTexture(o.TEXTURE_2D, G)),
                    o.bindFramebuffer(o.FRAMEBUFFER, p));
                  const h = o.checkFramebufferStatus(o.FRAMEBUFFER);
                  h !== o.FRAMEBUFFER_COMPLETE &&
                    console.error("Framebuffer is incomplete: " + h);
                  const { dec: c, Hi: m } = d(new Date(e.getTime() + f * t));
                  (o.uniform1f(R, c),
                    o.uniform1f(M, m),
                    o.uniform4fv(w, [1 / l, 0, 0, 1]),
                    o.bindBuffer(o.ARRAY_BUFFER, n),
                    o.enableVertexAttribArray(a),
                    o.vertexAttribPointer(a, 2, o.FLOAT, !1, 0, 0),
                    o.bindBuffer(o.ARRAY_BUFFER, s),
                    o.enableVertexAttribArray(u),
                    o.vertexAttribPointer(u, 2, o.FLOAT, !1, 0, 0),
                    o.viewport(0, 0, _, g),
                    o.enable(o.BLEND),
                    o.blendFunc(o.ONE, o.ONE),
                    o.drawArrays(o.TRIANGLE_STRIP, 0, 4),
                    r());
                });
              });
            }
            return (
              o.deleteFramebuffer(p),
              yield new Promise((t, e) => {
                window.requestAnimationFrame(() => {
                  if ((o.useProgram(i), c !== W))
                    return (o.deleteTexture(x), o.uniform4fv(w, m), void t(!0));
                  (o.activeTexture(o.TEXTURE2),
                    o.bindTexture(o.TEXTURE_2D, x),
                    o.uniform1i(D, 2),
                    o.uniform1i(L, 1),
                    H(),
                    o.uniform1i(L, 0),
                    o.uniform1i(D, 0),
                    o.deleteTexture(x),
                    o.uniform4fv(w, m),
                    t(!1));
                });
              })
            );
          }),
        updateColor: (t) => {
          const { colorVec: e } = t;
          (o.useProgram(i),
            o.uniform4fv(w, e),
            window.cancelAnimationFrame(O),
            (O = window.requestAnimationFrame(H)));
        },
        generateShadeProfile: (t) => {
          o.useProgram(i);
          const { dates: e, texCoords: r, shadeColor: n, sunColor: s } = t,
            c = r.length,
            f = e.length,
            m = o.getUniform(i, w);
          (o.uniform4fv(w, n), o.uniform4fv(P, s), o.uniform1i(U, 1));
          const _ = o.createTexture();
          (o.activeTexture(o.TEXTURE3),
            ot({
              gl: o,
              imageData: null,
              width: c,
              height: f,
              wrap: o.CLAMP_TO_EDGE,
              filter: o.NEAREST,
              format: o.RGBA,
              texture: _,
            }));
          const g = o.createFramebuffer();
          (o.bindFramebuffer(o.FRAMEBUFFER, g),
            o.framebufferTexture2D(
              o.FRAMEBUFFER,
              o.COLOR_ATTACHMENT0,
              o.TEXTURE_2D,
              _,
              0,
            ));
          const x = o.checkFramebufferStatus(o.FRAMEBUFFER);
          x !== o.FRAMEBUFFER_COMPLETE &&
            console.error("Framebuffer is incomplete: " + x);
          const p = r.map((t) => [t[0], t[1]]).flat(),
            E = o.createTexture();
          (o.activeTexture(o.TEXTURE2),
            ot({
              gl: o,
              texture: E,
              imageData: new Float32Array(p),
              width: p.length / 2,
              height: 1,
              wrap: o.CLAMP_TO_EDGE,
              filter: o.NEAREST,
              format: o.RG,
              internalFormat: o.RG32F,
              type: o.FLOAT,
            }),
            o.uniform1i(S, 2));
          const v = e
              .map((t) => {
                const { dec: e, Hi: r } = d(t);
                return [-e, r / 10];
              })
              .flat(),
            T = o.createTexture();
          (o.activeTexture(o.TEXTURE1),
            ot({
              gl: o,
              texture: T,
              imageData: new Float32Array(v),
              width: 1,
              height: e.length,
              wrap: o.CLAMP_TO_EDGE,
              filter: o.NEAREST,
              format: o.RG,
              internalFormat: o.RG32F,
              type: o.FLOAT,
            }),
            o.uniform1i(C, 1),
            null !== G &&
              (o.activeTexture(o.TEXTURE0), o.bindTexture(o.TEXTURE_2D, G)),
            o.bindBuffer(o.ARRAY_BUFFER, l),
            o.enableVertexAttribArray(a),
            o.vertexAttribPointer(a, 2, o.FLOAT, !1, 0, 0),
            o.bindBuffer(o.ARRAY_BUFFER, h),
            o.enableVertexAttribArray(u),
            o.vertexAttribPointer(u, 2, o.FLOAT, !1, 0, 0),
            o.viewport(0, 0, c, f),
            o.clear(o.COLOR_BUFFER_BIT),
            o.drawArrays(o.TRIANGLE_STRIP, 0, 4));
          const y = new Uint8Array(c * f * 4);
          return (
            o.readPixels(0, 0, c, f, o.RGBA, o.UNSIGNED_BYTE, y),
            o.deleteTexture(_),
            o.deleteTexture(T),
            o.deleteTexture(E),
            o.deleteFramebuffer(g),
            o.uniform1i(C, 0),
            o.uniform1i(S, 0),
            o.uniform1i(U, 0),
            o.uniform4fv(w, m),
            o.uniform4fv(P, [0, 0, 0, 0]),
            y
          );
        },
        generateLocationShadeProfile: (t) => {
          o.useProgram(i);
          const {
              startTime: e,
              endTime: r,
              tzId: n,
              texCoord: s,
              shadeColor: c,
              sunColor: f,
            } = t,
            d = o.getUniform(i, w),
            { outputWidth: m, outputHeight: _ } = K({
              startTime: e,
              endTime: r,
              tzId: n,
            });
          (o.uniform4fv(w, c),
            o.uniform4fv(P, f),
            o.uniform1i(I, 1),
            o.uniform2fv(B, [s[0], s[1]]));
          const g = o.createTexture();
          (o.activeTexture(o.TEXTURE2),
            ot({
              gl: o,
              imageData: null,
              width: m,
              height: _,
              wrap: o.CLAMP_TO_EDGE,
              filter: o.NEAREST,
              format: o.RGBA,
              texture: g,
            }));
          const x = o.createFramebuffer();
          (o.bindFramebuffer(o.FRAMEBUFFER, x),
            o.framebufferTexture2D(
              o.FRAMEBUFFER,
              o.COLOR_ATTACHMENT0,
              o.TEXTURE_2D,
              g,
              0,
            ));
          const p = o.checkFramebufferStatus(o.FRAMEBUFFER);
          (p !== o.FRAMEBUFFER_COMPLETE &&
            console.error("Framebuffer is incomplete: " + p),
            null !== G &&
              (o.activeTexture(o.TEXTURE0), o.bindTexture(o.TEXTURE_2D, G)),
            o.bindBuffer(o.ARRAY_BUFFER, l),
            o.enableVertexAttribArray(a),
            o.vertexAttribPointer(a, 2, o.FLOAT, !1, 0, 0),
            o.bindBuffer(o.ARRAY_BUFFER, h),
            o.enableVertexAttribArray(u),
            o.vertexAttribPointer(u, 2, o.FLOAT, !1, 0, 0),
            o.viewport(0, 0, m, _),
            o.clear(o.COLOR_BUFFER_BIT),
            o.drawArrays(o.TRIANGLE_STRIP, 0, 4));
          const E = new Uint8Array(m * _ * 4);
          return (
            o.readPixels(0, 0, m, _, o.RGBA, o.UNSIGNED_BYTE, E),
            o.deleteTexture(g),
            o.deleteFramebuffer(x),
            o.uniform1i(C, 0),
            o.uniform1i(I, 0),
            o.uniform4fv(w, d),
            o.uniform4fv(P, [0, 0, 0, 0]),
            { output: E, outputWidth: m, outputHeight: _ }
          );
        },
      };
    })({
      context: this._gl,
      setRenderBuffer: (e, r, o) => {
        const i = t.getSource(this.canvasSourceId).texture;
        (e.activeTexture(e.TEXTURE1),
          i.bind(e.LINEAR, e.CLAMP_TO_EDGE),
          (i.size = [r, o]),
          e.texImage2D(
            e.TEXTURE_2D,
            0,
            e.RGBA,
            r,
            o,
            0,
            e.RGBA,
            e.UNSIGNED_BYTE,
            null,
          ),
          e.bindFramebuffer(e.FRAMEBUFFER, this._framebuffer),
          e.framebufferTexture2D(
            e.FRAMEBUFFER,
            e.COLOR_ATTACHMENT0,
            e.TEXTURE_2D,
            i.texture,
            0,
          ),
          e.enable(e.BLEND),
          e.blendFunc(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA));
      },
    })),
      (this._tileMerger = new st(this._gl)),
      (this._canopyMerger = new st(this._gl)),
      (this._buildingRasterizer = new nt(this._gl)),
      document.body.appendChild(this._canvas),
      (this._canvas.style.display = "none"));
    const e = t.getBounds(),
      r = e.getNorthWest(),
      o = e.getNorthEast(),
      i = e.getSouthEast(),
      n = e.getSouthWest(),
      a = [
        [r.lng, r.lat],
        [o.lng, o.lat],
        [i.lng, i.lat],
        [n.lng, n.lat],
      ];
    return (
      t.addSource(this.canvasSourceId, {
        type: "canvas",
        canvas: this._canvas,
        coordinates: a,
        animate: !1,
      }),
      t.addLayer({
        id: this.canvasLayerId,
        type: "raster",
        source: this.canvasSourceId,
        paint: { "raster-fade-duration": 0 },
      }),
      t.addSource(this.attributionSourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "Point", coordinates: [-122.210598, 47.769799] },
        },
        attribution: '<a href="https://shademap.app/about">&copy; ShadeMap</a>',
      }),
      t.addLayer({
        id: this.attributionLayerId,
        type: "fill",
        source: this.attributionSourceId,
      }),
      this._map.on("moveend", this._moveEndHandler),
      this._moveEndHandler(),
      this
    );
  }
  onRemove() {
    return (
      this._map &&
        (this._map.off("moveend", this._moveEndHandler),
        this._map.removeLayer(this.attributionLayerId),
        this._map.removeLayer(this.canvasLayerId),
        this._map.removeSource(this.attributionSourceId),
        this._map.removeSource(this.canvasSourceId)),
      this._gl &&
        this._framebuffer &&
        this._gl.deleteFramebuffer(this._framebuffer),
      document.body.removeChild(this._canvas),
      this.options.debug("onRemove called"),
      this
    );
  }
  _getHeightMapCoords(t, e) {
    if (
      this._map &&
      this.options.sunExposure.enabled &&
      this._bounds &&
      this._heightMap
    ) {
      const r = this._map.unproject([t, e]);
      if (r.toString() === this._map.unproject([t, e + 1]).toString())
        return new o(-1, -1);
      const { visibleDEMPixelBounds: i, demZoom: n } = this._heightMap;
      return p(this._map).project(r, n).subtract(i.min);
    }
    return new o(-1, -1);
  }
  getHoursOfSun(t, e) {
    if (this.options.sunExposure.enabled) {
      const r = this._getHeightMapCoords(t, e),
        o = this.readPixel(r.x, r.y),
        { startDate: i, endDate: n } = this.options.sunExposure,
        a = n.getTime() - i.getTime(),
        s = g(o, 0.5, a);
      return Math.abs(s / 1e3 / 3600);
    }
    return 0;
  }
  remove() {
    this._map && this._map.removeLayer(this.id);
  }
  readPixel(t, e) {
    const r = new Uint8Array(4);
    if (this._map && this._gl && this._framebuffer) {
      const o = this._gl,
        i = this._map.getSource(this.canvasSourceId).texture;
      (o.activeTexture(o.TEXTURE1),
        i.bind(o.LINEAR, o.CLAMP_TO_EDGE),
        o.bindFramebuffer(o.FRAMEBUFFER, this._framebuffer),
        o.framebufferTexture2D(
          o.FRAMEBUFFER,
          o.COLOR_ATTACHMENT0,
          o.TEXTURE_2D,
          i.texture,
          0,
        ),
        this._gl.readPixels(
          t,
          e,
          1,
          1,
          this._gl.RGBA,
          this._gl.UNSIGNED_BYTE,
          r,
        ));
    }
    return r;
  }
  readPixels(t, e, r, o) {
    const i = new Uint8Array(r * o * 4);
    if (this._map && this._gl && this._framebuffer) {
      const n = this._gl,
        a = this._map.getSource(this.canvasSourceId).texture;
      (n.activeTexture(n.TEXTURE1),
        a.bind(n.LINEAR, n.CLAMP_TO_EDGE),
        n.bindFramebuffer(n.FRAMEBUFFER, this._framebuffer),
        n.framebufferTexture2D(
          n.FRAMEBUFFER,
          n.COLOR_ATTACHMENT0,
          n.TEXTURE_2D,
          a.texture,
          0,
        ),
        this._gl.readPixels(
          t,
          e,
          r,
          o,
          this._gl.RGBA,
          this._gl.UNSIGNED_BYTE,
          i,
        ));
    }
    return i;
  }
  _flush() {
    if (this._map) {
      this._map
        .getSource(this.canvasSourceId)
        .fire({ type: "data", dataType: "source", sourceDataType: "content" });
    }
    this.emit("idle");
  }
  _repositionCanvas(t) {
    if (this._map) {
      const e = this._map.getSource(this.canvasSourceId);
      if (e) {
        const r = t.getNorthWest(),
          o = t.getNorthEast(),
          i = t.getSouthEast(),
          n = t.getSouthWest(),
          a = [
            [r.lng, r.lat],
            [o.lng, o.lat],
            [i.lng, i.lat],
            [n.lng, n.lat],
          ];
        (e.setCoordinates(a), this.emit("idle"));
      }
    }
    return this;
  }
}
export { ut as default };
