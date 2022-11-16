precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

// void main() {
//   vec2 pos = 256.0 * gl_FragCoord.xy / u_resolution.x + u_time;
//   vec3 col = vec3(0.0);
//   for (int i=0; i<6; i++) {
//     vec2 a = floor(pos);
//     vec2 b = fract(pos);
//     vec4 w = fract((sin(a.x * 7.0 + 31.0 * a.y + 0.01 * u_time) +
//     vec4(0.035, 0.01, 0.0, 0.7)) * 13.545317);
//     col += w.xyz * smoothstep(0.45, 0.55, w.w) *
//     sqrt(16.0 * b.x * b.y * (1.0 - b.x) * (1.0 - b.y));
//     pos /= 2.0;
//     col /= 2.0;
//   }
//   col = pow(2.5 * col, vec3(1.0, 1.0, 0.7));
//   gl_FragColor = vec4(col, 1.0);
// }

float hash(vec3 p)  // replace this by something better
{
    p  = fract( p*0.3183099+.1 );
	p *= 17.0;
    return fract( p.x*p.y*p.z*(p.x+p.y+p.z) );
}

float noise( in vec3 x )
{
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
	
    return mix(mix(mix( hash(i+vec3(0,0,0)), 
                        hash(i+vec3(1,0,0)),f.x),
                   mix( hash(i+vec3(0,1,0)), 
                        hash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix( hash(i+vec3(0,0,1)), 
                        hash(i+vec3(1,0,1)),f.x),
                   mix( hash(i+vec3(0,1,1)), 
                        hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}

const mat3 m = mat3( 0.00,  0.80,  0.60,
                    -0.80,  0.36, -0.48,
                    -0.60, -0.48,  0.64 );

void main()
{
	vec2 p = (-u_resolution.xy + 2.0*gl_FragCoord.xy) / u_resolution.y;

     // camera movement	
	float an = 0.5*u_time;
	vec3 ro = vec3( 2.5*cos(an), 1.0, 2.5*sin(an) );
    vec3 ta = vec3( 0.0, 1.0, 0.0 );
    // camera matrix
    vec3 ww = normalize( ta - ro );
    vec3 uu = normalize( cross(ww,vec3(0.0,1.0,0.0) ) );
    vec3 vv = normalize( cross(uu,ww));
	// create view ray
	vec3 rd = normalize( p.x*uu + p.y*vv + 1.5*ww );

    // sphere center	
	vec3 sc = vec3(0.0,1.0,0.0);

    // raytrace
	float tmin = 10000.0;
	vec3  nor = vec3(0.0);
	float occ = 1.0;
	vec3  pos = vec3(0.0);
	
	// raytrace-plane
	float h = (0.0-ro.y)/rd.y;
	if( h>0.0 ) 
	{ 
		tmin = h; 
		nor = vec3(0.0,1.0,0.0); 
		pos = ro + h*rd;
		vec3 di = sc - pos;
		float l = length(di);
		occ = 1.0 - dot(nor,di/l)*1.0*1.0/(l*l); 
	}

	// raytrace-sphere
	vec3  ce = ro - sc;
	float b = dot( rd, ce );
	float c = dot( ce, ce ) - 1.0;
	h = b*b - c;
	if( h>0.0 )
	{
		h = -b - sqrt(h);
		if( h<tmin ) 
		{ 
			tmin=h; 
			nor = normalize(ro+h*rd-sc); 
			occ = 0.5 + 0.5*nor.y;
		}
	}

    // shading/lighting	
	vec3 col = vec3(0.9);
	if( tmin<100.0 )
	{
	    pos = ro + tmin*rd;
	    float f = 0.0;
		
		if( p.x<0.0 )
		{
			f = noise( 16.0*pos );
		}
		else
		{
            vec3 q = 8.0*pos;
            f  = 0.5000*noise( q ); q = m*q*2.01;
            f += 0.2500*noise( q ); q = m*q*2.02;
            f += 0.1250*noise( q ); q = m*q*2.03;
            f += 0.0625*noise( q ); q = m*q*2.01;
		}
		
		
		
		f *= occ;
		col = vec3(f*1.2);
		col = mix( col, vec3(0.9), 1.0-exp( -0.003*tmin*tmin ) );
	}
	
	col = sqrt( col );
	
	col *= smoothstep( 0.006, 0.008, abs(p.x) );
	
	gl_FragColor = vec4( col, 1.0 );
}