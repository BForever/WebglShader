#version 300 es
#ifdef GL_ES
precision highp float;
#endif

// Config
const float height = 480.0;
const float width = 640.0;
out vec4 FragColor;

const int SampleRate = 190;

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
    bool reflect;
    bool diffuse;
    vec3 albedo;
    float fuzz;
};

Material materials[3];

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
vec3 RandomPointInUnitSphere();
vec2 RandomPointInUnitCircle();
vec3 SkyColor(Ray ray);
vec3 getColor(Ray ray,float tmin,float tmax);
vec3 GetPoint(Ray ray,float t);
bool HitSphere(Sphere sphere, Ray ray,float tmin,float tmax,out HitRecord rec);

Ray GenRay(float u,float v){
    Ray ray;
    ray.origin = vec3(RandomPointInUnitCircle()/60.0,-2);
    ray.direction = normalize(vec3(u,v,0)-ray.origin);

    return ray;
}
void initData(vec4 FragCoord){
    randCnt = 0;
    u = FragCoord.x/width*4.0-2.0;
    v = FragCoord.y/height*3.0-1.5;

    // Materials
    materials[0].reflect = true;
    materials[0].albedo = vec3(0.9);
    materials[0].fuzz = 0.3;

    materials[1].reflect = false;
    materials[1].diffuse = true;
    materials[1].albedo = vec3(0.3,0.5,0);

    materials[2].reflect = false;
    materials[2].diffuse = true;
    materials[2].albedo = vec3(0.4,0.2,0.3);

    // Spheres
    spheres[1].center = vec3(0,0,-1);
    spheres[1].radius = 0.3;
    spheres[1].materialID = 0;

    spheres[0].center = vec3(0,-100.3,-1);
    spheres[0].radius = 100.0;
    spheres[0].materialID = 1;

    spheres[2].center = vec3(-0.6,0,-1);
    spheres[2].radius = 0.3;
    spheres[2].materialID = 2;

    spheres[3].center = vec3(0.6,0,-1);
    spheres[3].radius = 0.3;
    spheres[3].materialID = 2;


}
void main() {
    initData(gl_FragCoord);

    Ray ray;
    vec3 color;
    int i;
    for(i=0;i<SampleRate;i++){
        ray = GenRay(u+Rand()*0.0/width,v+Rand()*0.0/height);
        color += getColor(ray,0.0001,200.0);
    }

    FragColor = vec4(color/float(SampleRate),1);
}

vec3 getColor(Ray ray,float tmin,float tmax){
    bool hit=true;
    Ray tempRay = ray;
    vec3 colorFactor=vec3(1);
    int depth=15;

    while(hit&&depth>0){
        HitRecord record;
        float closest = tmax;
        hit = false;

        // Check hit
        int i;
        for(i=0;i<Num_spheres;i++){
            HitRecord temprec;
            if(HitSphere(spheres[i],tempRay,tmin,closest,temprec)){
                // Update
                hit = true;
                closest = record.t;
                record = temprec;
            }
        }

        if(hit){
            // Material
            Material mt = materials[record.materialID];
            colorFactor *= mt.albedo;
            tempRay.origin = record.p;
            if(mt.reflect){
                 tempRay.direction = normalize(reflect(tempRay.direction,record.normal)+mt.fuzz*RandomPointInUnitSphere());
            }else{
                 tempRay.direction = normalize(record.normal + RandomPointInUnitSphere());
            }

            // Limit
            depth--;
        }

    }
    return sqrt(colorFactor * SkyColor(tempRay));
}

vec3 SkyColor(Ray ray){
    float t = 0.5 * ray.direction.y + 1.0;
    return(1.0 - t) * vec3(1) + t * vec3(0.5, 0.7, 1);
}

bool HitSphere(Sphere sphere, Ray ray,float tmin,float tmax,out HitRecord rec)
{
    rec.materialID = sphere.materialID;
    vec3 center = sphere.center;
    float radius = sphere.radius;
    vec3 oc = ray.origin - center;
    float a = dot(ray.direction,  ray.direction);
    float b = 2.0 * dot(oc, ray.direction);
    float c = dot(oc, oc) - radius * radius;
    //实际上是判断这个方程有没有根，如果有2个根就是击中
    float discriminant = b * b - 4.0 * a * c;
    if (discriminant > 0.0)
    {
         //带入并计算出最靠近射线源的点
         float temp = (-b - sqrt(discriminant)) / a * 0.5;
         if (temp < tmax && temp > tmin)
         {
               rec.t = temp;
               rec.p = GetPoint(ray,rec.t);
               rec.normal = normalize(rec.p - center);
               return true;
         }
         //否则就计算远离射线源的点
         temp = (-b + sqrt(discriminant)) / a * 0.5;
         if (temp < tmax && temp > tmin)
         {
               rec.t = temp;
               rec.p = GetPoint(ray,rec.t);
               rec.normal = normalize(rec.p - center);
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
float RandXY(float x, float y){
     return fract(cos(x * (12.9898) + y * (4.1414)) * 43758.5453);
}
float Rand(){
    float r1 = RandXY(u, randomSeed);
    float r2 = RandXY(v, float(randCnt++));
    float r3 = RandXY(r1, r2);
    return r3;
}

vec3 RandomPointInUnitSphere(){
    return Rand()*normalize(vec3(Rand(),Rand(),Rand()));
}

vec2 RandomPointInUnitCircle(){
    return Rand()*normalize(vec2(Rand(),Rand()));
}
