uniform vec2 leftEyePosition;//in worldSpace
uniform vec2 rightEyePosition;//in worldSpace
uniform vec2 mouthPosition;//in worldSpace
uniform float mouthOpen;
uniform vec2 head_displacement;

uniform vec4 faceEllipse_ST;
uniform float swayTime;
uniform float swaySpeed;
uniform float swayAmplitude;
uniform sampler2D animationNoise;
varying float alpha;

float sqr(float x)
{
    return x * x;
}
float pow3(float x)
{
    return x * x * x;
}
vec2 Rescale(vec2 coordinates, float scale, float offset)
{
    return coordinates * scale + offset;
}
vec2 lerp(vec2 b, vec2 t, float s)
{
    return b + s * (t-b);
}
#define MOUTH_TO_FACE 1.0

#define EYE_INFLUENCE 0.35//TODO
#define MOUTH_INFLUENCE 0.06//TODO
vec3 GenerateInfluenceMasks(vec2 positionWS, vec2 blinkDir, float ipd)
{
    float leftEyeInfluence =
        1.0 - sqr(clamp(distance(positionWS, leftEyePosition) / (EYE_INFLUENCE * ipd), 0.0, 1.0));
    float rightEyeInfluence =
        1.0 - sqr(clamp(distance(positionWS, rightEyePosition) / (EYE_INFLUENCE * ipd), 0.0, 1.0));
    float mouthInfluence =
        1.0 - clamp(distance(positionWS, mouthPosition + blinkDir * 0.3) / (MOUTH_INFLUENCE * ipd), 0.0, 1.0);
    mouthInfluence *= 1.0 - max(leftEyeInfluence, rightEyeInfluence) * 0.65;
    return vec3(leftEyeInfluence, rightEyeInfluence, mouthInfluence);
}
vec2 AnimateHeadSway(vec2 positionOS, float scale)//scale = ipd
{
    vec2 ellipse = (positionOS * scale) * 2.0 * faceEllipse_ST.xy + faceEllipse_ST.zw;
    float faceMask = 1.0 - clamp(sqr(ellipse.x) + sqr(ellipse.y), 0.0, 1.0);
    faceMask = 0.75;

    float P_x = mod(swaySpeed * swayTime, 1.0);

    #if defined(GLES3)
        vec4 noiseTextureSample = textureLod(animationNoise, vec2(P_x, 0.5), 0.0);
    #else
        vec4 noiseTextureSample = texture2DLod(animationNoise, vec2(P_x, 0.5), 0.0);
    #endif
    vec2 noise = noiseTextureSample.xy * 2.0 - 1.0;
    noise *= swayAmplitude * (1.0 / scale);

    vec2 animatedPositionOS = positionOS + noise * scale * faceMask;
    return animatedPositionOS;
}

vec2 DisplaceHead(vec2 positionOS, float scale) {
    vec2 ellipse = positionOS * 2.0 * faceEllipse_ST.xy + faceEllipse_ST.zw;
    float faceMask = 1.0 - clamp(sqr(ellipse.x) + sqr(ellipse.y), 0.0, 1.0);
    faceMask = 0.75;
    vec2 animatedPositionOS = positionOS + head_displacement * faceMask * scale;
    return animatedPositionOS;
}

vec2 AnimatePositionOS(vec2 positionOS, vec2 positionWS, float blinkL, float blinkR, float talk)
{
    vec2 animatedPositionOS = positionOS;

    vec2 eyeLine = rightEyePosition - leftEyePosition;
    float ipd = length(eyeLine);
    vec2 blinkDir = vec2(eyeLine.y, -eyeLine.x);
    vec3 influenceMask = GenerateInfluenceMasks(positionWS, blinkDir, ipd);
    animatedPositionOS.y *= 1.0 - (influenceMask.x * blinkL);
    animatedPositionOS.y *= 1.0 - (influenceMask.y * blinkR);
    animatedPositionOS.y -= (influenceMask.z * talk * ipd * 0.3);
    animatedPositionOS = AnimateHeadSway(animatedPositionOS, ipd);
    // TODO this is the new bit
    animatedPositionOS = DisplaceHead(animatedPositionOS, ipd);
    return animatedPositionOS;
}
void main()
{
    alpha = 1.0 - (clamp((1.0 - color.z) * 1.0, 0.0, 1.0) * clamp(mouthOpen * 16.0, 0.0, 1.0));
    float horizontalFalloff = clamp(sqr(abs(position.x * 2.0)), 0.0, 1.0);

    //alpha = horizontalFalloff;
    vec2 mouthClosedOS = vec2(color.x - 0.5, color.y - 0.65) * 0.8;
    //alpha = abs(mouthClosedOS.y);
    //alpha = abs(position.z);

    //alpha = 0.5;
    //gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, position.z, 1.0);
    vec2 animatedPositionOS = lerp(mouthClosedOS.xy, position.xz, (mouthOpen - (horizontalFalloff * 0.4)) * 0.7);
    //vec2 animatedPositionOS = position.xz;
    //animatedPositionOS.y *= 1.0 - clamp(-animatedPositionOS.y * 10.0 * (1.0 - mouthOpen) * horizontalFalloff, 0.0, 1.0);
    //animatedPositionOS.y *= (1.0 - ((1.0 - mouthOpen) * horizontalFalloff)) * 0.5;
    //animatedPositionOS *= clamp(mouthOpen * 2.0 + 0.6, 0.0, 1.0);

    vec2 positionWS = (modelMatrix * vec4(animatedPositionOS.x, position.y, animatedPositionOS.y, 1.0)).xy;
    animatedPositionOS = AnimatePositionOS(animatedPositionOS, positionWS, 0.0, 0.0, mouthOpen);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(animatedPositionOS.x, position.y, animatedPositionOS.y, 1.0);
}