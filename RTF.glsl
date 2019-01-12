#version 300 es
#ifdef GL_ES
precision highp float;
#endif

// Config
const float width = 640.0;
const float height = 480.0;

out vec4 FragColor;

const int SampleRate = 6;

struct Camera{
    vec3 Position;
    vec3 Front;
    vec3 Right;
    vec3 Up;
    float Zoom;
    float Near;
    float Far;
};
uniform Camera camera;
uniform samplerCube skybox;
// Structure
struct Ray{
    vec3 origin;
    vec3 direction;
};

Ray ray;

struct HitRecord{
    float t;
    vec3 p;
    vec3 normal;
    int materialID;
};

struct Material{
    bool refract;
    bool reflect;
    bool diffuse;
    vec3 albedo;
    float fuzz;
    float refidx;
};

Material materials[4];

struct Sphere{
    vec3 center;
    float radius;
    int materialID;
};

// Data
#define Num_spheres 4
Sphere spheres[Num_spheres];


// Utilities
float u,v;
int randCnt;
uniform float randomSeed;

// Declaration
float RandXY(float x, float y);
float Rand();
float HaltonX(int Index);
float HaltonY(int Index);
float HaltonZ(int Index);
vec3 RandomPointInUnitSphere();
vec2 RandomPointInUnitCircle();
bool _refract(vec3 v, vec3 n,float ni_over_nt,out vec3 refracted);
float schlick(float cosine, float ref_idx);
vec3 SkyColor(Ray ray);
vec3 getColor(Ray ray,float tmin,float tmax);
vec3 GetPoint(Ray ray,float t);
bool HitSphere(Sphere sphere, Ray ray,float tmin,float tmax,out HitRecord rec);

Ray GenRay(vec2 pos){
    Ray ray;
    ray.origin = vec3(camera.Position);
    ray.direction = normalize(camera.Near*normalize(camera.Front)+pos.x*normalize(camera.Right)+pos.y*normalize(camera.Up));

    return ray;
}
void initData(vec4 FragCoord){
    randCnt = 0;

    float screenHeight = 2.0 * camera.Near * tan(radians(camera.Zoom/2.0));
    float screenWidth = screenHeight * width / height;
    u = FragCoord.x*screenWidth/width-screenWidth/2.0;
    v = FragCoord.y*screenHeight/height-screenHeight/2.0;

    // Materials
    materials[0].reflect = true;
    materials[0].albedo = vec3(0.9,0.6,0.2);
    materials[0].fuzz = 0.3;

    materials[1].reflect = false;
    materials[1].diffuse = true;
    materials[1].albedo = vec3(0.8,0.8,0);

    materials[2].reflect = false;
    materials[2].diffuse = true;
    materials[2].albedo = vec3(0.1,0.2,0.5);

    materials[3].refract = true;
    materials[3].refidx = 1.5;
    materials[3].albedo = vec3(1.0);

    // Spheres
    spheres[1].center = vec3(0,0,0);
    spheres[1].radius = 0.3;
    spheres[1].materialID = 2;

    spheres[0].center = vec3(0,-1000.3,0);
    spheres[0].radius = 1000.0;
    spheres[0].materialID = 1;

    spheres[2].center = vec3(-0.6,0,0);
    spheres[2].radius = 0.3;
    spheres[2].materialID = 3;

    spheres[3].center = vec3(0.6,0,0);
    spheres[3].radius = 0.3;
    spheres[3].materialID = 0;



}
void main() {
    initData(gl_FragCoord);

    Ray ray;
    vec3 color;
    int i;
    for(i=0;i<SampleRate;i++){
//        ray = GenRay(u+Rand()*2.5/width,v+Rand()*2.5/height);
        ray = GenRay(vec2(u+HaltonX(i)*2.5/width,v+HaltonY(i)*2.5/height));
        color += getColor(ray,0.0001,camera.Far);
    }

    FragColor = vec4(color/float(SampleRate),1);
}

vec3 getColor(Ray ray,float tmin,float tmax){
    bool hit=true;
    Ray tempRay = ray;
    vec3 colorFactor=vec3(1);
    int depth=30;

    // Trace loop
    while(hit&&depth>0){
        HitRecord record;
        float closest = tmax;
        hit = false;

        // Check closest hit
        int i;
        for(i=0;i<Num_spheres;i++){
            HitRecord temprec;
            if(HitSphere(spheres[i],tempRay,tmin,closest,temprec)){
                hit = true;
                closest = temprec.t;
                record = temprec;
            }
        }

        if(hit){
            // Material
            Material mt = materials[record.materialID];
            vec3 outnormal;
            vec3 reflected = reflect(tempRay.direction,record.normal);
            if(mt.refract){
                float ni_over_nt;
                vec3 refracted;
                float reflectProb = 1.0;
                float cosine;

                if(dot(tempRay.direction,record.normal)>0.0){
                    outnormal = -record.normal;
                    ni_over_nt = mt.refidx;
                    cosine = ni_over_nt * dot(tempRay.direction, record.normal);
                }else{
                    outnormal = record.normal;
                    ni_over_nt = 1.0/mt.refidx;
                    cosine = -dot(tempRay.direction, record.normal);
                }

                if(_refract(tempRay.direction,outnormal,ni_over_nt,refracted)){
                    reflectProb = schlick(cosine,mt.refidx);
                }

                if(Rand() <= reflectProb){
                    colorFactor *= mt.albedo;
                    tempRay.origin = record.p;
                    tempRay.direction = normalize(reflected+mt.fuzz*RandomPointInUnitSphere());
                }else{
                    tempRay.origin = record.p;
                    tempRay.direction = normalize(refracted);
                }
            }else{
                colorFactor *= mt.albedo;
                tempRay.origin = record.p;
                if(mt.reflect){
                     tempRay.direction = normalize(reflected+mt.fuzz*RandomPointInUnitSphere());
                }else{
                     tempRay.direction = normalize(record.normal + RandomPointInUnitSphere());
                }
            }

            // Limit
            depth--;
//            return (vec3(sqrt(record.t)));
        }

    }

//    if(depth <= 0){
//        return vec3(0);
//    }

    return sqrt(colorFactor * SkyColor(tempRay));
}

vec3 SkyColor(Ray ray){
//    float t = 0.5 * ray.direction.y + 1.0;
//    return(1.0 - t) * vec3(1) + t * vec3(0.5, 0.7, 1);

    return texture(skybox, ray.direction).xyz;
}

bool HitSphere(Sphere sphere, Ray ray,float tmin,float tmax,out HitRecord rec)
{
    ray.direction = normalize(ray.direction);
    rec.materialID = sphere.materialID;
    vec3 center = sphere.center;
    float radius = sphere.radius;
    vec3 oc = ray.origin - center;
    float a = dot(ray.direction,  ray.direction);
    float b = dot(oc, ray.direction);
    float c = dot(oc, oc) - radius * radius;
    //实际上是判断这个方程有没有根，如果有2个根就是击中
    float discriminant = b * b - a * c;
    if (discriminant > 0.0)
    {
         //带入并计算出最靠近射线源的点
         float temp = (-b - sqrt(discriminant)) / a;
         if (temp < tmax && temp > tmin)
         {
               rec.t = temp;
               rec.p = GetPoint(ray,rec.t);
               rec.normal = normalize(rec.p - center);
               rec.materialID = sphere.materialID;
               return true;
         }
         //否则就计算远离射线源的点
         temp = (-b + sqrt(discriminant)) / a;
         if (temp < tmax && temp > tmin)
         {
               rec.t = temp;
               rec.p = GetPoint(ray,rec.t);
               rec.normal = normalize(rec.p - center);
               rec.materialID = sphere.materialID;
               return true;
         }
    }
    return false;
}

// Ray
vec3 GetPoint(Ray ray,float t){
    return ray.origin + t * ray.direction;
}

// Utilities
float RadicalInverse(int Base, int i)
{
	float Digit, Radical, Inverse;
	Digit = Radical = 1.0 / float(Base);
	Inverse = 0.0;
	while(i>0)
	{
		// i余Base求出i在"Base"进制下的最低位的数
		// 乘以Digit将这个数镜像到小数点右边
		Inverse += Digit * float (i % Base);
		Digit *= Radical;

		// i除以Base即可求右一位的数
		i /= Base;
	}
	return Inverse;
}
float HaltonX(int Index)
{
	return RadicalInverse(2, Index);
}
float HaltonY(int Index)
{
	return RadicalInverse(3, Index);
}
float HaltonZ(int Index)
{
	return RadicalInverse(5, Index);
}

float RandXY(float x, float y){
     return fract(cos(x * (12.9898) + y * (4.1414)) * 43758.5453);
}
float Rand(){
    float r1 = RandXY(float(randCnt++), randomSeed);
    float r2 = RandXY(randomSeed,float(randCnt++) );
    float r3 = RandXY(r1, r2);
    float r4 = RandXY(u, r3);
    float r5 = RandXY(v, r4);
    return r5;
}

int seed2D=0;int seed3D=0;
vec3 RandomPointInUnitSphere(){
    return Rand()*normalize(vec3(Rand(),Rand(),Rand()));
}

vec2 RandomPointInUnitCircle(){
    return Rand()*normalize(vec2(Rand(),Rand()));
}

bool _refract(vec3 v, vec3 n,float ni_over_nt,out vec3 refracted){
    vec3 uv = normalize(v);
    float dt = dot(uv,n);
    float discriminant = 1.0 - ni_over_nt*ni_over_nt*(1.0-dt*dt);
    if(discriminant > 0.0){
        refracted = ni_over_nt * (uv - n*dt) - n*sqrt(discriminant);
        return true;
    }else{
        return false;
    }
}

float schlick(float cosine, float ref_idx)
{
    float r0 = (1.0 - ref_idx) / (1.0 + ref_idx);
    r0 *= r0;
    return r0 + (1.0 - r0) * pow((1.0 - cosine), 5.0);
}

