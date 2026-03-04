/**
 * Highmaps JS v12.5.0-modified (2026-03-04)
 * @module highcharts/modules/contour
 * @requires highcharts
 *
 * (c) 2009-2025 Highsoft AS
 *
 * License: www.highcharts.com/license
 */import*as e from"../highcharts.js";import"./coloraxis.js";var t={};t.n=e=>{var r=e&&e.__esModule?()=>e.default:()=>e;return t.d(r,{a:r}),r},t.d=(e,r)=>{for(var o in r)t.o(r,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:r[o]})},t.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t);let r=e.default;var o=t.n(r);let i=e.default.Color;var n=t.n(i);let s=e.default.SeriesRegistry;var a=t.n(s);let{scatter:{prototype:{pointClass:u}}}=a().seriesTypes,f=`

struct VertexInput {
    @location(0) pos: vec3f
}

struct VertexOutput {
    @builtin(position) pos: vec4f,
    @location(0) originalPos: vec3f,
    @location(1) valExtremes: vec2f,
}

@group(0) @binding(0) var<uniform> uExtremes: vec4f;
@group(0) @binding(1) var<uniform> uValueExtremes: vec2f;
@group(0) @binding(9) var<uniform> uIsInverted: u32;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    let pos = input.pos;

    let xMin = uExtremes[0];
    let xMax = uExtremes[1];
    let yMin = uExtremes[2];
    let yMax = uExtremes[3];

    var posX: f32;
    var posY: f32;
    if (uIsInverted > 0u) {
        posX = (1.0 - (pos.y - yMin) / (yMax - yMin)) * 2.0 - 1.0;
        posY = (1.0 - (pos.x - xMin) / (xMax - xMin)) * 2.0 - 1.0;
    } else {
        posX = (pos.x - xMin) / (xMax - xMin) * 2.0 - 1.0;
        posY = (pos.y - yMin) / (yMax - yMin) * 2.0 - 1.0;
    }

    output.valExtremes = uValueExtremes;
    output.originalPos = pos.xyz;
    output.pos = vec4f(posX, posY, 0, 1);

    return output;
}

// ------------------------------------------------

struct FragmentInput {
    @location(0) originalPos: vec3f,
    @location(1) valExtremes: vec2f
}

@group(0) @binding(2) var<storage> uColorStops: array<vec4<f32>>;
@group(0) @binding(3) var<uniform> uColorStopsCount: u32;
@group(0) @binding(4) var<uniform> uContourInterval: f32;
@group(0) @binding(5) var<uniform> uContourOffset: f32;
@group(0) @binding(6) var<uniform> uSmoothColoring: u32;
@group(0) @binding(7) var<uniform> uContourLineWidth: f32;
@group(0) @binding(8) var<uniform> uContourLineColor: vec3f;

fn getColor(value: f32) -> vec3<f32> {
    let stopCount = uColorStopsCount;

    if (stopCount == 0u) {
        return vec3<f32>(1.0, 1.0, 1.0);
    }

    for (var i: u32 = 0u; i < stopCount - 1u; i = i + 1u) {
        if (value < uColorStops[i + 1u].x) {
            let t = (value - uColorStops[i].x) /
                (uColorStops[i + 1u].x - uColorStops[i].x);

            return mix(uColorStops[i].yzw, uColorStops[i + 1u].yzw, t);
        }
    }

    return uColorStops[stopCount - 1u].yzw;
}

@fragment
fn fragmentMain(input: FragmentInput) -> @location(0) vec4f {
    let val = input.originalPos.z;

    // Contour lines
    let lineWidth: f32 = uContourLineWidth;

    let val_dx: f32 = dpdx(val);
    let val_dy: f32 = dpdy(val);
    let gradient: f32 = length(vec2f(val_dx, val_dy));

    let epsilon: f32 = max(uContourInterval * 1.0e-6, 1.0e-12);
    let adjustedLineWidth: f32 = lineWidth * gradient + epsilon;

    let adjustedVal: f32 = val - uContourOffset;
    let valDiv: f32 = adjustedVal / uContourInterval;
    let valMod: f32 = adjustedVal - uContourInterval * floor(valDiv);

    let lineMask: f32 = smoothstep(0.0, adjustedLineWidth, valMod) * (
        1.0 - smoothstep(
            uContourInterval - adjustedLineWidth,
            uContourInterval,
            valMod
        )
    );

    // Background color
    let minHeight: f32 = input.valExtremes.x;
    let maxHeight: f32 = input.valExtremes.y;

    var bgColor: vec3f;
    if (uSmoothColoring > 0u) {
        bgColor = getColor((val - minHeight) / (maxHeight - minHeight));
    } else {
        let adjustedVal: f32 = val - uContourOffset;
        let averageValInBand: f32 = floor(
            adjustedVal / uContourInterval
        ) * uContourInterval + uContourOffset + uContourInterval / 2.0;

        bgColor = getColor(
            (averageValInBand - minHeight) /
            (maxHeight - minHeight)
        );
    }

    // Mix
    var pixelColor = bgColor;
    if (lineWidth > 0.0) {
        pixelColor = mix(uContourLineColor, pixelColor, lineMask);
    }

    return vec4(pixelColor, 1.0);
}

`,l=class{constructor(e){this.points=e;let t=e.length>>>1;this.epsilon=4*Number.EPSILON;let r=1/0,o=-1/0,i=1/0,n=-1/0;for(let s=0;s<t;s++){let t=e[s<<1],a=e[(s<<1)+1];t<r&&(r=t),t>o&&(o=t),a<i&&(i=a),a>n&&(n=a)}let s=o-r||1,a=n-i||1;this.minX=r,this.minY=i,this.invScaleX=1/s,this.invScaleY=1/a;let u=new Uint32Array(t),f=t=>(e[t<<1]-r)*this.invScaleX,l=t=>(e[(t<<1)+1]-i)*this.invScaleY;for(let e=0;e<t;e++)u[e]=e;u.sort((e,t)=>f(e)-f(t)||l(e)-l(t));let h=+!!t,c,d;for(let e=1;e<t;++e)c=u[h-1],d=u[e],(f(c)!==f(d)||l(c)!==l(d))&&(u[h++]=d);this.ids=u.subarray(0,h),this.triangles=this.triangulate()}triangulate(){let e,t,r=this.ids.length;if(r<3)return new Uint32Array(0);let o=this.points,{minX:i,minY:n,invScaleX:s,invScaleY:a}=this,u=e=>(o[e<<1]-i)*s,f=e=>(o[(e<<1)+1]-n)*a,l=(e,t,r)=>{let o=u(e),i=f(e),n=u(t)-o,s=f(t)-i,a=u(r)-o,l=f(r)-i,h=(Math.abs(n*l)+Math.abs(s*a))*this.epsilon;return n*l-s*a>h},h=(e,t,r,o)=>{if(e===o||t===o||r===o)return!1;let i=u(e)-u(o),n=f(e)-f(o),s=u(t)-u(o),a=f(t)-f(o),l=u(r)-u(o),h=f(r)-f(o),c=i*i+n*n,d=s*s+a*a,m=l*l+h*h,g=a*m-d*h,p=s*m-d*l,v=s*h-a*l,U=(Math.abs(i*g)+Math.abs(n*p)+Math.abs(c*v))*this.epsilon;return i*g-n*p+c*v>U},c=Math.max(32,8*r+7&-4),d=new Int32Array(c),m=new Int32Array(c),g=new Uint32Array(c),p=new Uint8Array(c),v=0,U=e=>m[m[e]],x=e=>U(m[e]),C=e=>g[U(e)],b=e=>m[d[x(e)]],y=e=>m[d[m[e]]],B=e=>d[U(e)],O=(e,t)=>l(e,g[t],C(t)),w=(e,t)=>l(e,C(t),g[t]),M=(e,t)=>w(C(e),t),A=(e,t)=>{(e=>{if(e<=c)return;let t=c<<1;for(;t<e;)t<<=1;let r=new Int32Array(t),o=new Int32Array(t),i=new Uint32Array(t),n=new Uint8Array(t);r.set(d),o.set(m),i.set(g),n.set(p),d=r,m=o,g=i,p=n,c=t})(v+4);let r=v,o=v+1,i=v+2,n=v+3;return v+=4,m[r]=o,m[o]=i,m[i]=n,m[n]=r,d[r]=r,d[i]=i,d[o]=n,d[n]=o,g[r]=e,g[i]=t,g[o]=0xffffffff,g[n]=0xffffffff,r},P=(e,t)=>{let r=m[d[e]],o=m[d[t]],i=d[e],n=d[o],s=d[r];d[e]=d[t],d[t]=i,d[r]=n,d[o]=s},I=(e,t)=>{let r=A(C(e),g[t]);return P(r,b(e)),P(U(r),t),r},S=e=>{P(e,y(e));let t=U(e);P(t,y(t))},E=this.ids,F=(e,t)=>{let r=t-e;if(2===r){let t=A(E[e],E[e+1]);return[t,U(t)]}if(3===r){let t=A(E[e],E[e+1]),r=A(E[e+1],E[e+2]);P(U(t),r);let o=E[e],i=E[e+1],n=E[e+2];if(l(o,i,n))return I(r,t),[t,U(r)];if(l(o,n,i)){let e=I(r,t);return[U(e),e]}return[t,U(r)]}let o=e+(r+1>>>1),i=F(e,o),n=F(o,t),s=i[0],a=i[1],u=n[0],f=n[1];for(;;)if(O(g[u],a))a=b(a);else if(w(g[a],u))u=B(u);else break;let c=I(U(u),a);for(g[a]===g[s]&&(s=U(c)),g[u]===g[f]&&(f=c);;){let e=d[U(c)];if(M(e,c))for(;h(C(c),g[c],C(e),C(d[e]));){let t=d[e];S(e),e=t}let t=y(c);if(M(t,c))for(;h(C(c),g[c],C(t),C(y(t)));){let e=y(t);S(t),t=e}if(!M(e,c)&&!M(t,c))break;c=!M(e,c)||M(t,c)&&h(C(e),g[e],g[t],C(t))?I(t,U(c)):I(U(c),U(e))}return[s,f]},N=F(0,r)[0];for(;O(C(d[N]),N);)N=d[N];let _=[N],L=0;{let e=N;do _.push(U(e)),p[e]=1,e=b(e);while(e!==N)}let G=[];for(;L<_.length;){let r=_[L++];if(!p[r]){e=r;do G.push(g[e]),p[t=U(e)]||_.push(t),p[e]=1,e=b(e);while(e!==r)}}return new Uint32Array(G)}},h=e.default.SVGRenderer;var c=t.n(h);let{doc:d,win:m}=o();function g(e,t,r,o){let i={};return!function e(t,i,n,s){let a=r?i:t;C(t,function(r,u){if(!s&&o&&o.indexOf(u)>-1&&i[u]){var f;r=v(f=r)?f:[f],n[u]=[];for(let t=0;t<Math.max(r.length,i[u].length);t++)i[u][t]&&(void 0===r[t]?n[u][t]=i[u][t]:(n[u][t]={},e(r[t],i[u][t],n[u][t],s+1)))}else U(r,!0)&&!r.nodeType?(n[u]=v(r)?[]:{},e(r,i[u]||{},n[u],s+1),0===Object.keys(n[u]).length&&("colorAxis"!==u||0!==s)&&delete n[u]):(t[u]!==i[u]||u in t&&!(u in i))&&"__proto__"!==u&&"constructor"!==u&&(n[u]=a[u])})}(e,t,i,0),i}function p(e){return U(e)&&"number"==typeof e.nodeType}function v(e){let t=Object.prototype.toString.call(e);return"[object Array]"===t||"[object Array Iterator]"===t}function U(e,t){return!!e&&"object"==typeof e&&(!t||!v(e))}function x(e,...t){let r,o=[e,...t],i={},n=function(e,t){return"object"!=typeof e&&(e={}),C(t,function(r,o){if("__proto__"!==o&&"constructor"!==o){let i;!U(r,!0)||(i=r?.constructor,U(r,!0)&&!p(r)&&i?.name&&"Object"!==i.name)||p(r)?e[o]=t[o]:e[o]=n(e[o]||{},r)}}),e};!0===e&&(i=o[1],o=Array.prototype.slice.call(o,2));let s=o.length;for(r=0;r<s;r++)i=n(i,o[r]);return i}function C(e,t,r){for(let o in e)Object.hasOwnProperty.call(e,o)&&t.call(r||e[o],e[o],o,e)}Array.prototype.find;let{seriesTypes:{scatter:b}}=a();class y extends b{getContourData(){let e=this.points,t=e.length,r=new Float32Array(3*t),o=new Float64Array(2*t);for(let i=0;i<t;i++){let{x:t,y:n=0,value:s}=e[i],a=2*i,u=3*i;o[a]=t,o[a+1]=n,r[u]=t,r[u+1]=n,r[u+2]=s??0}return[new l(o).triangles,r]}update(e,t){e=g(e,this.userOptions);let r=["smoothColoring","contourInterval","contourOffset","lineColor","lineWidth"],o=Object.keys(e).some(e=>!r.includes(e)),i=o?void 0:this.setOptions(x(this.userOptions,e)),n=!!i&&Object.keys(g(i,this.options)).some(e=>!r.includes(e));o||n?super.update(e,t):(this.options=i,this.setUniforms())}drawPoints(){let{group:e}=this;if(!e)return;this.canvas||(this.foreignObject=document.createElementNS("http://www.w3.org/2000/svg","foreignObject"),e.element.appendChild(this.foreignObject),this.canvas=document.createElement("canvas"),this.foreignObject.appendChild(this.canvas));let{canvas:t,xAxis:r,yAxis:o}=this,i=this.foreignObject,n=i.width.baseVal.value,s=i.height.baseVal.value,{devicePixelRatio:a}=window,u=r.len,f=o.len;this.chart.inverted&&([u,f]=[f,u]),n!==u&&(i.setAttribute("width",u),t.width=u*a,t.style.width=u+"px"),s!==f&&(i.setAttribute("height",f),t.height=f*a,t.style.height=f+"px"),this.renderFrame?this.renderFrame():this.run()}async run(){let e=this.chart,t=e.renderer,o=this.canvas,i=navigator.gpu,n=this.context=o.getContext("webgpu");if(t.asyncCounter+=1,!i||!n)return void(0,r.error)(36,!1);if(n){let e=this.device;this.adapter||(this.adapter=await i.requestAdapter()),!e&&this.adapter&&(e=this.device=await this.adapter.requestDevice());let t=i.getPreferredCanvasFormat();if(e){n.configure({device:e,format:t,colorSpace:"display-p3",alphaMode:"premultiplied",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC});let[r,o]=this.getContourData(),{vertex:i,index:s,extremesUniform:a,valueExtremesUniform:u,contourIntervalUniform:l,contourOffsetUniform:h,smoothColoringUniform:c,lineWidthUniform:d,contourLineColor:m,colorAxisStopsCountUniform:g,colorAxisStopsUniform:p,isInvertedUniform:v}=this.buffers={vertex:e.createBuffer({size:o.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),index:e.createBuffer({size:r.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST}),extremesUniform:e.createBuffer({size:4*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),valueExtremesUniform:e.createBuffer({size:2*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),contourIntervalUniform:e.createBuffer({size:4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),contourOffsetUniform:e.createBuffer({size:4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),smoothColoringUniform:e.createBuffer({size:4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),lineWidthUniform:e.createBuffer({size:4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),contourLineColor:e.createBuffer({size:12,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),colorAxisStopsCountUniform:e.createBuffer({size:4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),colorAxisStopsUniform:e.createBuffer({size:64*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),isInvertedUniform:e.createBuffer({size:4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST})};e.queue.writeBuffer(i,0,o),e.queue.writeBuffer(s,0,r);let U=e.createShaderModule({code:f}),x=e.createRenderPipeline({layout:"auto",vertex:{module:U,entryPoint:"vertexMain",buffers:[{arrayStride:12,attributes:[{format:"float32x3",offset:0,shaderLocation:0}]}]},fragment:{module:U,entryPoint:"fragmentMain",targets:[{format:t}]},primitive:{topology:"triangle-list"}}),C=e.createBindGroup({layout:x.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:a,label:"extremesUniformBuffer"}},{binding:1,resource:{buffer:u,label:"valueExtremesUniformBuffer"}},{binding:2,resource:{buffer:p,label:"colorAxisStopsBuffer"}},{binding:3,resource:{buffer:g,label:"colorAxisStopsCountBuffer"}},{binding:4,resource:{buffer:l,label:"contourIntervalUniformBuffer"}},{binding:5,resource:{buffer:h,label:"contourOffsetUniformBuffer"}},{binding:6,resource:{buffer:c,label:"smoothColoringUniformBuffer"}},{binding:7,resource:{buffer:d,label:"lineWidthUniformBuffer"}},{binding:8,resource:{buffer:m,label:"contourLineColorBuffer"}},{binding:9,resource:{buffer:v,label:"isInvertedUniformBuffer"}}]});this.renderFrame=function(){this.setUniforms(!1);let t=e.createCommandEncoder(),o=n.getCurrentTexture(),a=t.beginRenderPass({colorAttachments:[{view:o.createView(),loadOp:"clear",clearValue:[0,0,0,0],storeOp:"store"}]});a.setPipeline(x),a.setVertexBuffer(0,i),a.setIndexBuffer(s,"uint32"),a.setBindGroup(0,C),a.drawIndexed(r.length),a.end(),e.queue.submit([t.finish()])},this.renderFrame()}}t.asyncCounter--,t.asyncCounter||!e||e.hasLoaded||e.onload()}destroy(){this.canvas?.parentElement?.remove(),super.destroy()}drawGraph(){}setUniforms(e=!0){this.setFrameExtremesUniform(!1),this.setValueExtremesUniform(!1),this.setColorAxisStopsUniforms(!1),this.setContourIntervalUniform(!1),this.setContourOffsetUniform(!1),this.setSmoothColoringUniform(!1),this.setLineWidthUniform(!1),this.setContourLineColorUniform(!1),this.setIsInvertedUniform(e)}setContourIntervalUniform(e=!0){this.device&&this.buffers?.contourIntervalUniform&&(this.device.queue.writeBuffer(this.buffers.contourIntervalUniform,0,new Float32Array([this.getContourInterval()])),e&&this.renderFrame?.())}setContourOffsetUniform(e=!0){this.device&&this.buffers?.contourOffsetUniform&&(this.device.queue.writeBuffer(this.buffers.contourOffsetUniform,0,new Float32Array([this.getContourOffset()])),e&&this.renderFrame?.())}setSmoothColoringUniform(e=!0){this.device&&this.buffers?.smoothColoringUniform&&(this.device.queue.writeBuffer(this.buffers.smoothColoringUniform,0,new Float32Array([this.getSmoothColoring()])),e&&this.renderFrame?.())}setLineWidthUniform(e=!0){this.device&&this.buffers?.lineWidthUniform&&(this.device.queue.writeBuffer(this.buffers.lineWidthUniform,0,new Float32Array([this.getLineWidth()])),e&&this.renderFrame?.())}setContourLineColorUniform(e=!0){this.device&&this.buffers?.contourLineColor&&(this.device.queue.writeBuffer(this.buffers.contourLineColor,0,new Float32Array(this.getContourLineColor())),e&&this.renderFrame?.())}setFrameExtremesUniform(e=!0){this.device&&this.buffers?.extremesUniform&&(this.device.queue.writeBuffer(this.buffers.extremesUniform,0,new Float32Array(this.getFrameExtremes())),e&&this.renderFrame?.())}setValueExtremesUniform(e=!0){this.device&&this.buffers?.valueExtremesUniform&&(this.device.queue.writeBuffer(this.buffers.valueExtremesUniform,0,new Float32Array(this.getValueAxisExtremes())),e&&this.renderFrame?.())}setColorAxisStopsUniforms(e=!0){let t=this.buffers?.colorAxisStopsUniform,r=this.buffers?.colorAxisStopsCountUniform;if(this.device&&t&&r){let{array:o,length:i}=this.getColorAxisStopsData();this.device.queue.writeBuffer(t,0,o),this.device.queue.writeBuffer(r,0,new Uint32Array([i])),e&&this.renderFrame?.()}}setIsInvertedUniform(e=!0){this.device&&this.buffers?.isInvertedUniform&&(this.device.queue.writeBuffer(this.buffers.isInvertedUniform,0,new Uint32Array([+!!this.chart.inverted])),e&&this.renderFrame?.())}getContourInterval(){let e=this.options.contourInterval??(()=>{let[e,t]=this.getValueAxisExtremes();return function(e,t,r,o,i){var n,s;let a,u=e;r=function(){let e=arguments,t=e.length;for(let r=0;r<t;r++){let t=e[r];if(null!=t)return t}}(r,Math.pow(10,Math.floor(Math.log(e)/Math.LN10)));let f=e/r;for(t||(t=[1,2,2.5,5,10]),a=0;a<t.length&&(u=t[a],!(f<=(t[a]+(t[a+1]||t[a]))/2));a++);return n=u*r,s=-Math.round(Math.log(.001)/Math.LN10),u=n>1e14?n:parseFloat(n.toPrecision(s||14))}((t-e)/10)})();return isNaN(e)||e<=0?-1:e}getContourOffset(){let e=this.options.contourOffset??0;return isNaN(e)||e<=0?0:e}getSmoothColoring(){return+!!this.options.smoothColoring}getLineWidth(){return this.userOptions.lineWidth??1}getContourLineColor(){let{lineColor:e="#000000"}=this.options;return y.rgbaAsFrac(new(n())(e).rgba)}getFrameExtremes(){let{xAxis:e,yAxis:t}=this;return[e.toValue(0,!0),e.toValue(e.len,!0),t.toValue(t.len,!0),t.toValue(0,!0)]}getValueAxisExtremes(){let e=this.valueMin;isNaN(e||NaN)&&isNaN((e=this.colorAxis?.min)||NaN)&&(e=Math.min(...this.points.map(e=>e.value||0)));let t=this.valueMax;return isNaN(t||NaN)&&isNaN((t=this.colorAxis?.max)||NaN)&&(t=Math.max(...this.points.map(e=>e.value||0))),[e||0,t||0]}getColorAxisStopsData(){let e,t=this.colorAxis?.stops;if(t)for(let r of(e=[],t)){let t=r?.color?.rgba;t&&e.push(r[0],...y.rgbaAsFrac(t))}return{array:new Float32Array(e??[0,0,0,0,1,1,1,1]),length:t?.length||2}}static rgbaAsFrac(e){return[e[0],e[1],e[2]].map(e=>e/255)}}y.defaultOptions=x(b.defaultOptions,{colorKey:"value",clip:!1,marker:{symbol:"cross",states:{hover:{lineColor:"black"}}},states:{hover:{halo:void 0}},zIndex:0}),c().prototype.symbols.cross=function(e,t,r,o){return[["M",e,t],["L",e+r,t+o],["M",e+r,t],["L",e,t+o],["z"]]},function(e,t){let r;for(r in e||(e={}),t)e[r]=t[r]}(y.prototype,{pointClass:class extends u{},pointArrayMap:["y","value"],keysAffectYAxis:["y"],invertible:!1}),a().registerSeriesType("contour",y);let B=o();export{B as default};