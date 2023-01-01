window.D=(function(D){

if(!window.vec3||!window.mat3||!window.vec2||!window.mat2||!window.vec4||!window.mat4||!window.quat){
    
    alert('The D.js library is dependent on glMatrix! Make sure it is imported and initalized before D.js. Import glMatrix with a script using this scr: https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js')
    console.log('error using glMatrix')
}

D.PI=Math.PI
D.HALF_PI=Math.PI*0.5
D.TWO_PI=Math.PI*2
D.TO_RAD=Math.PI/180
D.TO_DEG=180/Math.PI
D.INV_255=1/255
D.random=(min,max)=>Math.random()*(max-min)+min
D.constrain=(x,a,b)=>x<a?a:x>b?b:x

D.meshKey={x:0,y:1,z:2,u:3,v:4,nx:5,ny:6,nz:7,r:8,g:9,b:10,a:11}
D.meshKeyAmount=0

for(let i in D.meshKey){D.meshKeyAmount++}

D.getContext=(canv,context='webgl',data={})=>{
    
    D.version=['webgl','webgl2'].indexOf(context)+1
    D.context=context
    
    D.gl=canv.getContext(context,data)
    
    if(!D.gl||!D.version){
        
        alert('"'+D.context+'" is not supported!')
    }

    return D.gl
}

D.getExtension=(e)=>{
    
    if(!D.gl.getExtension(e)){
        
        alert(D.context+' extension "'+e+'" is not supported!')
    }
}

D.clear=(r=0,g=r,b=r,a=1)=>{
    
    D.gl.clearColor(r,g,b,a)
    D.gl.clear(D.gl.COLOR_BUFFER_BIT|D.gl.DEPTH_BUFFER_BIT)
}

D.viewport=(x,y,w,h)=>{
    
    D.viewportWidth=w
    D.viewportHeight=h
    D.gl.viewport(x,y,w,h)
    D.aspect=w/h
}

D.createProgram=(vsh_src,fsh_src)=>{
    
    let gl=D.gl,vshText=vsh_src.trim(),fshText=fsh_src.trim()
    
    vsh=gl.createShader(gl.VERTEX_SHADER)
    fsh=gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(vsh,vshText)
    gl.shaderSource(fsh,fshText)
    gl.compileShader(vsh)
    gl.compileShader(fsh)
    
    let p=gl.createProgram()
    gl.attachShader(p,vsh)
    gl.attachShader(p,fsh)
    gl.linkProgram(p)
    
    let locations={},types={},text=vsh_src.trim().split('\n')
    
    for(let i in text){
        
        let words=text[i].trim().replaceAll(';','').split(' ')
        
        if(words[0]==='attribute'||words[0]==='in'||words[0]==='uniform'){
            
            locations[words[2]]=gl['get'+({in:'Attrib',attribute:'Attrib',uniform:'Uniform'}[words[0]])+'Location'](p,words[2])
            types[words[2]]=words[1]
            
            if(words[0]==='attribute'||words[0]==='in'){
                
                gl.enableVertexAttribArray(locations[words[2]])
            }
            
        }
    }
    
    text=fsh_src.trim().split('\n')
    
    for(let i in text){
        
        let words=text[i].trim().replaceAll(';','').split(' ')
        
        if(words[0]==='uniform'){
            
            words[2]=words[2].substring(0,words[2].indexOf('[')<0?words[2].length:words[2].indexOf('['))
            
            locations[words[2]]=gl.getUniformLocation(p,words[2])
            types[words[2]]=words[1]
        }
    }
    
    for(let i in types){
        
        types[i]={
            
            float:'1f',
            vec2:'2fv',
            vec3:'3fv',
            vec4:'4fv',
            int:'1iv',
            ivec2:'2iv',
            ivec3:'3iv',
            ivec4:'4iv',
            sampler2D:'1i',
            mat2:'Matrix2fv',
            mat3:'Matrix3fv',
            mat4:'Matrix4fv'
            
        }[types[i]]
    }
    
    return {gl:p,locations:locations,uniformTypes:types}
}

D.setUniform=(name,data)=>{
    
    let gl=D.gl
    
    if(D.currentProgram.uniformTypes[name][0]==='M'){
        
        gl['uniform'+D.currentProgram.uniformTypes[name]](D.currentProgram.locations[name],gl.FALSE,data)
        
    } else {
        
        gl['uniform'+D.currentProgram.uniformTypes[name]](D.currentProgram.locations[name],data)
        
    }
}

D.useProgram=(program)=>{
    
    D.gl.useProgram(program.gl)
    D.currentProgram=program
}

D.createMesh=(data,pointers,instancedPointers,type='STATIC')=>{
    
    verts=Float32Array.from(data.verts)
    index=Uint16Array.from(data.index)
    
    type=type.toUpperCase()+'_DRAW'
    
    let gl=D.gl,mesh={},pointerStr=''
    
    mesh.wireframe=data.wireframe
    
    mesh.indexAmount=index.length
    
    mesh.vertBuffer=gl.createBuffer()
    mesh.indexBuffer=gl.createBuffer()
    
    gl.bindBuffer(gl.ARRAY_BUFFER,mesh.vertBuffer)
    gl.bufferData(gl.ARRAY_BUFFER,verts,gl[type])
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,index,gl[type])
    
    for(let i in pointers){
        
        let p=pointers[i]
        
        pointerStr+='gl.vertexAttribPointer(locations["'+p[0]+'"],'+p[1]+',gl.FLOAT,gl.FALSE,'+p[2]+','+p[3]+');'
        
    }
    
    mesh.attribFunction=Object.constructor('gl','locations',pointerStr)
    
    mesh.attribPointers=pointers
    
    if(instancedPointers){
        
        let i_pointerStr='',clearDivisorsStr=''
        
        for(let i in instancedPointers){
            
            let p=instancedPointers[i]
            
            i_pointerStr+='gl.vertexAttribPointer(locations["'+p[0]+'"],'+p[1]+',gl.FLOAT,gl.FALSE,'+p[2]+','+p[3]+');gl.vertexAttribDivisor(locations["'+p[0]+'"],1);'
            
            clearDivisorsStr+='gl.vertexAttribDivisor(locations["'+p[0]+'"],0);'
            
        }
        
        mesh.instancedAttribFunction=Object.constructor('gl','locations',i_pointerStr)
        mesh.clearDivisorsFunction=Object.constructor('gl','locations',clearDivisorsStr)
        
        mesh.instancedAttribPointers=instancedPointers
        mesh.instanceData=[]
        mesh.instanceSize=instancedPointers[0][2]*0.25
        
        mesh.instanceBuffer=gl.createBuffer()
    }
    
    return mesh
}

D.renderMesh=(mesh)=>{
    
    D.gl.bindBuffer(D.gl.ARRAY_BUFFER,mesh.vertBuffer)
    D.gl.bindBuffer(D.gl.ELEMENT_ARRAY_BUFFER,mesh.indexBuffer)
    mesh.attribFunction(D.gl,D.currentProgram.locations)
    
    if(mesh.instanceData){
        
        D.gl.bindBuffer(D.gl.ARRAY_BUFFER,mesh.instanceBuffer)
        D.gl.bufferData(D.gl.ARRAY_BUFFER,Float32Array.from(mesh.instanceData),D.gl.DYNAMIC_DRAW)
    
        mesh.instancedAttribFunction(D.gl,D.currentProgram.locations)
        
        D.gl.drawElementsInstanced(mesh.wireframe?D.gl.LINES:D.gl.TRIANGLES,mesh.indexAmount,D.gl.UNSIGNED_SHORT,0,mesh.instanceData.length/mesh.instanceSize)
        
        mesh.clearDivisorsFunction(D.gl,D.currentProgram.locations)
        
    } else {
        
        D.gl.drawElements(mesh.wireframe?D.gl.LINES:D.gl.TRIANGLES,mesh.indexAmount,D.gl.UNSIGNED_SHORT,0)
    }
}

D.clearInstances=(mesh)=>mesh.instanceData=[]

D.addInstance=(mesh,data)=>{
    
    mesh.instanceData.push(...data)
}

D.enable3D=()=>{
    
    D.gl.enable(D.gl.CULL_FACE)
    D.gl.cullFace(D.gl.BACK)
    D.gl.enable(D.gl.DEPTH_TEST)
    D.gl.depthFunc(D.gl.LEQUAL)
}

D.enable=(t)=>D.gl.enable(D.gl[t])
D.disable=(t)=>D.gl.disable(D.gl[t])
D.cullFace=(t)=>D.gl.cullFace(D.gl[t])
D.depthFunc=(t)=>D.gl.depthFunc(D.gl[t])
D.blendFunc=(t1,t2)=>D.gl.blendFunc(D.gl[t1],D.gl[t2])

D.enableBlend=()=>{
    
    D.gl.enable(D.gl.BLEND)
    D.gl.blendFunc(D.gl.SRC_ALPHA,D.gl.ONE_MINUS_SRC_ALPHA)
}

D.prespectiveMatrix=(fov=80,aspect=D.aspect,zn=0.1,zf=1000)=>{
    
    let f=Math.tan(D.HALF_PI-fov*D.TO_RAD*0.5),
        rangeInv=1/(zn-zf)
        
    return new Float32Array([
        f/aspect,0,0,0,
        0,f,0,0,
        0,0,(zn+zf)*rangeInv,-1,
        0,0,zn*zf*rangeInv*2,0
    ])
}

D.createIdentityMatrix=()=>mat4.identity(new Float32Array(16))
D.READ_ONLY_IDENTITY_MATRIX=D.createIdentityMatrix()

D.setViewMatrix=(mat,proj,x,y,z,yaw,pitch,roll=0,zoomBack=0)=>{
    
    mat4.fromXRotation(mat,pitch)
    mat4.rotateY(mat,mat,yaw)
    
    if(roll){
        
        mat4.rotateZ(mat,mat,roll)
    }
    
    let p=[-x-mat[2]*zoomBack,-y-mat[6]*zoomBack,-z-mat[10]*zoomBack]
    
    mat4.translate(mat,mat,p)
    
    let m=mat.slice()
    
    mat4.multiply(mat,proj,mat)
    
    return {camPos:p,modelMatrix:m}
}

D.createTexture=(width=D.viewportWidth,height=D.viewportHeight,data=null,filter='LINEAR',wrap='CLAMP_TO_EDGE',format='RGBA',internalFormat='RGBA',type='UNSIGNED_BYTE',mipmap=false)=>{
    
    let gl=D.gl,t=gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D,t)
    gl.texImage2D(gl.TEXTURE_2D,0,gl[format],width,height,0,gl[internalFormat],gl[type],data)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl[filter])
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl[filter])
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl[wrap])
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl[wrap])
    
    if(mipmap){
        
        gl.generateMipmap(gl.TEXTURE_2D)
    }
    
    return {texture:t,width:width,height:height}
}

D.bindTexture=(texture)=>D.gl.bindTexture(D.gl.TEXTURE_2D,texture===null?null:texture.texture)

D.createFramebuffer=(target=false,depth=false,attachment='COLOR_ATTACHMENT0')=>{
    
    let gl=D.gl,f=gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER,f)
    
    if(target)
        gl.framebufferTexture2D(gl.FRAMEBUFFER,gl[attachment],gl.TEXTURE_2D,target.texture,0)
    
    if(depth){
        
        if(!target)
            target={width:D.viewportWidth,height:D.viewportHeight}
        
        let depthBuffer=gl.createRenderbuffer()
        gl.bindRenderbuffer(gl.RENDERBUFFER,depthBuffer)
        gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,target.width,target.height)
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depthBuffer)
        
    }
    
    return f
}

D.bindFramebuffer=(framebuffer)=>D.gl.bindFramebuffer(D.gl.FRAMEBUFFER,framebuffer)

D.drawBuffers=(params)=>{
    
    let gl=D.gl,arr=[]
    
    for(let i in params){
        
        gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER,gl['COLOR_ATTACHMENT'+i],gl.TEXTURE_2D,params[i].texture,0)
        
        arr.push(gl['COLOR_ATTACHMENT'+i])
    }
    
    gl.drawBuffers(arr)
}

D.activeTextures=(params)=>{
    
    let gl=D.gl
    
    for(let i in params){
        
        gl.activeTexture(gl['TEXTURE'+i])
        gl.bindTexture(gl.TEXTURE_2D,params[i].texture)
    }
}

D.createMeshData=(params)=>{
    
    params.vl=params.vl||0
    
    let verts=[],index=[]
    
    for(let j in params.meshes){
        
        let t=params.meshes[j]
        
        switch(t.type){
            
            case 'box':
                
                {
                    
                    let x=t.x||0,
                        y=t.y||0,
                        z=t.z||0,
                        rx=t.rx||0,
                        ry=t.ry||0,
                        rz=t.rz||0,
                        w=t.w||1,
                        h=t.h||1,
                        l=t.l||1,
                        c=[t.r||0,t.g||0,t.b||0,t.a||1],
                        order=params.order,
                        vl=params.vl+(verts.length/order.length)
                        _quat=quat.fromEuler([],rx,ry,rz),
                        _tex=t.textureMapping||{top:{x:0,y:0,w:1,h:1},bottom:{x:0,y:0,w:1,h:1},left:{x:0,y:0,w:1,h:1},right:{x:0,y:0,w:1,h:1},front:{x:0,y:0,w:1,h:1},back:{x:0,y:0,w:1,h:1}}
                    
                    let v=[
                        
                        [-0.5*w,0.5*h,-0.5*l],
                        [-0.5*w,0.5*h,0.5*l],
                        [0.5*w,0.5*h,0.5*l],
                        [0.5*w,0.5*h,-0.5*l],
                        [-0.5*w,-0.5*h,-0.5*l],
                        [-0.5*w,-0.5*h,0.5*l],
                        [0.5*w,-0.5*h,0.5*l],
                        [0.5*w,-0.5*h,-0.5*l],
                    ],
                    n=[
                        
                        [0,1,0],
                        [0,0,1],
                        [0,0,-1],
                        [1,0,0],
                        [-1,0,0],
                        [0,-1,0],
                    ]
                    
                    for(let i in v){
                        
                        vec3.transformQuat(v[i],v[i],_quat)
                        
                        vec3.add(v[i],v[i],[x,y,z])
                        
                        if(i<6){
                            
                            vec3.transformQuat(n[i],n[i],_quat)
                        }
                    }
                    
                    let _verts=[
                        
                        ...v[0],1*_tex.top.w+_tex.top.x,1*_tex.top.h+_tex.top.y,...n[0],...c,
                        ...v[1],1*_tex.top.w+_tex.top.x,0*_tex.top.h+_tex.top.y,...n[0],...c,
                        ...v[2],0*_tex.top.w+_tex.top.x,0*_tex.top.h+_tex.top.y,...n[0],...c,
                        ...v[3],0*_tex.top.w+_tex.top.x,1*_tex.top.h+_tex.top.y,...n[0],...c,
                        
                        ...v[1],0*_tex.back.w+_tex.back.x,0*_tex.back.h+_tex.back.y,...n[1],...c,
                        ...v[2],1*_tex.back.w+_tex.back.x,0*_tex.back.h+_tex.back.y,...n[1],...c,
                        ...v[5],0*_tex.back.w+_tex.back.x,1*_tex.back.h+_tex.back.y,...n[1],...c,
                        ...v[6],1*_tex.back.w+_tex.back.x,1*_tex.back.h+_tex.back.y,...n[1],...c,
                        
                        ...v[0],1*_tex.front.w+_tex.front.x,0*_tex.front.h+_tex.front.y,...n[2],...c,
                        ...v[3],0*_tex.front.w+_tex.front.x,0*_tex.front.h+_tex.front.y,...n[2],...c,
                        ...v[4],1*_tex.front.w+_tex.front.x,1*_tex.front.h+_tex.front.y,...n[2],...c,
                        ...v[7],0*_tex.front.w+_tex.front.x,1*_tex.front.h+_tex.front.y,...n[2],...c,
                        
                        ...v[2],0*_tex.right.w+_tex.right.x,0*_tex.right.h+_tex.right.y,...n[3],...c,
                        ...v[3],1*_tex.right.w+_tex.right.x,0*_tex.right.h+_tex.right.y,...n[3],...c,
                        ...v[6],0*_tex.right.w+_tex.right.x,1*_tex.right.h+_tex.right.y,...n[3],...c,
                        ...v[7],1*_tex.right.w+_tex.right.x,1*_tex.right.h+_tex.right.y,...n[3],...c,
                        
                        ...v[0],0*_tex.left.w+_tex.left.x,0*_tex.left.h+_tex.left.y,...n[4],...c,
                        ...v[1],1*_tex.left.w+_tex.left.x,0*_tex.left.h+_tex.left.y,...n[4],...c,
                        ...v[4],0*_tex.left.w+_tex.left.x,1*_tex.left.h+_tex.left.y,...n[4],...c,
                        ...v[5],1*_tex.left.w+_tex.left.x,1*_tex.left.h+_tex.left.y,...n[4],...c,
                        
                        ...v[4],0*_tex.bottom.w+_tex.bottom.x,1*_tex.bottom.h+_tex.bottom.y,...n[5],...c,
                        ...v[5],0*_tex.bottom.w+_tex.bottom.x,0*_tex.bottom.h+_tex.bottom.y,...n[5],...c,
                        ...v[6],1*_tex.bottom.w+_tex.bottom.x,0*_tex.bottom.h+_tex.bottom.y,...n[5],...c,
                        ...v[7],1*_tex.bottom.w+_tex.bottom.x,1*_tex.bottom.h+_tex.bottom.y,...n[5],...c
                        
                    ]
                    
                    index.push(
                        
                        vl,1+vl,2+vl,
                        vl,2+vl,3+vl,
                        5+vl,6+vl,7+vl,
                        6+vl,5+vl,4+vl,
                        8+vl,9+vl,10+vl,
                        11+vl,10+vl,9+vl,
                        14+vl,13+vl,12+vl,
                        13+vl,14+vl,15+vl,
                        18+vl,17+vl,16+vl,
                        17+vl,18+vl,19+vl,
                        22+vl,21+vl,20+vl,
                        23+vl,22+vl,20+vl
                    )
                    
                    for(let i=0,l=_verts.length;i<l;i+=D.meshKeyAmount){
                        
                        for(let k in order){
                            
                            verts.push(_verts[i+D.meshKey[order[k]]])
                        }
                    }
                    
                }
            
            break
            
            case 'sphere':
                
                {
                    
                    
                    let f=(1+5 ** 0.5)*0.5,
                        T=4 ** t.detail,
                        tex=t.textureMapping||{side:{x:0,y:0,w:1,h:1}}
                    
                    let vertices=new Float32Array((10*T+2)*3);
                    vertices.set(Float32Array.of(
                    -1,f,0,1,f,0,-1,-f,0,1,-f,0,
                    0,-1,f,0,1,f,0,-1,-f,0,1,-f,
                    f,0,-1,f,0,1,-f,0,-1,-f,0,1));
                    let triangles=Uint32Array.of(
                    0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,
                    11,10,2,5,11,4,1,5,9,7,1,8,10,7,6,
                    3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,
                    9,8,1,4,9,5,2,4,11,6,2,10,8,6,7);
                    
                    let _v=12;
                    let midCache=t.detail ? new Map() : null;
                    
                    function addMidPoint(a,b) {
                        let _key=Math.floor((a+b)*(a+b+1)*0.5)+Math.min(a,b);
                        let i=midCache.get(_key);
                        if (i !== undefined) { midCache.delete(_key); return i; }
                        midCache.set(_key,_v);
                        for (let k=0; k < 3; k++)vertices[3*_v+k]=(vertices[3*a+k]+vertices[3*b+k])*0.5;
                        i=_v++;
                        return i;
                    }
                    
                    let trianglesPrev=triangles;
                    for (let i=0; i < t.detail; i++) {
                    triangles=new Uint32Array(trianglesPrev.length<<2);
                    for (let k=0; k < trianglesPrev.length; k += 3) {
                      let v1=trianglesPrev[k];
                      let v2=trianglesPrev[k+1];
                      let v3=trianglesPrev[k+2];
                      let a=addMidPoint(v1,v2);
                      let b=addMidPoint(v2,v3);
                      let c=addMidPoint(v3,v1);
                      let t=k<<2;
                      triangles[t++]=v1; triangles[t++]=a; triangles[t++]=c;
                      triangles[t++]=v2; triangles[t++]=b; triangles[t++]=a;
                      triangles[t++]=v3; triangles[t++]=c; triangles[t++]=b;
                      triangles[t++]=a;  triangles[t++]=b; triangles[t++]=c;
                    }
                    trianglesPrev=triangles;
                    }
                    
                    for (let i=0; i < vertices.length; i += 3) {
                        let m=1 / Math.hypot(vertices[i],vertices[i+1],vertices[i+2]);
                        vertices[i] *= m;
                        vertices[i+1] *= m;
                        vertices[i+2] *= m;
                    }
                    
                    for(let i in triangles){
                        
                        index.push(triangles[i]+params.vl+(verts.length/params.order.length))
                        
                    }
                    
                    let rad=t.radius
                    __verts=[]
                    
                    for(let i=0,l=vertices.length;i<l;i+=3){
                        
                        __verts.push(vertices[i]*rad+t.x,vertices[i+1]*rad+t.y,vertices[i+2]*rad+t.z,(-Math.acos(vertices[i])/D.PI)*tex.side.w+tex.side.x,(-vertices[i+1]*0.5+0.5)*tex.side.h+tex.side.y,vertices[i],vertices[i+1],vertices[i+2],t.r||0,t.g||0,t.b||0,t.a||1)
                    }
                    
                    for(let i=0,l=__verts.length;i<l;i+=D.meshKeyAmount){
                        
                        for(let k in params.order){
                            
                            verts.push(__verts[i+D.meshKey[params.order[k]]])
                        }
                    }
                }
                
            break
            
            case 'plane':
                
                {
                    
                    let x=t.x||0,
                        y=t.y||0,
                        z=t.z||0,
                        c=[t.r||0,t.g||0,t.b||0,t.a||1],
                        order=params.order,
                        vl=params.vl+(verts.length/order.length),
                        _quat=quat.fromEuler([],t.rx||0,t.ry||0,t.rz||0),
                        s=t.size,
                        tex=t.textureMapping||{side:{x:0,y:0,w:1,h:1}}
                    
                    let v=[
                        
                        [-0.5*s,0,-0.5*s],
                        [-0.5*s,0,0.5*s],
                        [0.5*s,0,0.5*s],
                        [0.5*s,0,-0.5*s]
                        
                    ],n=[0,1,0]
                    
                    vec3.transformQuat(n,n,_quat)
                    
                    for(let i in v){
                        
                        vec3.transformQuat(v[i],v[i],_quat)
                        
                        vec3.add(v[i],v[i],[x,y,z])
                    }
                    
                    let _verts=[
                        
                        ...v[0],1*tex.side.w+tex.side.x,1*tex.side.h+tex.side.y,...n,...c,
                        ...v[1],1*tex.side.w+tex.side.x,0*tex.side.h+tex.side.y,...n,...c,
                        ...v[2],0*tex.side.w+tex.side.x,0*tex.side.h+tex.side.y,...n,...c,
                        ...v[3],0*tex.side.w+tex.side.x,1*tex.side.h+tex.side.y,...n,...c,
                    ]
                    
                    index.push(
                        
                        vl,1+vl,2+vl,
                        vl,2+vl,3+vl
                    )
                    
                    for(let i=0,l=_verts.length;i<l;i+=D.meshKeyAmount){
                        
                        for(let k in order){
                            
                            verts.push(_verts[i+D.meshKey[order[k]]])
                        }
                    }
                    
                }
            
            break
            
            case 'cylinder':
                
                {
                    
                    let x=t.x||0,
                        y=t.y||0,
                        z=t.z||0,
                        rx=t.rx||0,
                        ry=t.ry||0,
                        rz=t.rz||0,
                        rad=t.radius,
                        rad2=t.radius2??t.radius,
                        detail=t.detail,
                        hei=t.height,
                        r=t.r||0,
                        g=t.g||0,
                        b=t.b||0,
                        a=t.a||1,
                        order=params.order,
                        vl=params.vl+(verts.length/order.length),
                        _quat=quat.fromEuler([],rx,ry,rz),
                        __verts=[],
                        _index=[],
                        tex=t.textureMapping||{top:{x:0,y:0,w:1,h:1},side:{x:0,y:0,w:1,h:1},bottom:{x:0,y:0,w:1,h:1}}
                    
                    for(let _t=0,inc=D.TWO_PI/detail;_t<=D.TWO_PI;_t+=inc){
                        
                        let t1=_t-inc*0.5,t2=_t+inc*0.5
                        __verts.push(
                            Math.cos(t1)*rad,Math.sin(t1)*rad,hei*0.5,(1.0-(t1/D.TWO_PI))*tex.side.w+tex.side.x,1*tex.side.h+tex.side.y,Math.cos(t1),Math.sin(t1),0,r,g,b,a,
                            Math.cos(t1)*rad2,Math.sin(t1)*rad2,-hei*0.5,(1.0-(t1/D.TWO_PI))*tex.side.w+tex.side.x,0*tex.side.h+tex.side.y,Math.cos(t1),Math.sin(t1),0,r,g,b,a,
                            Math.cos(t2)*rad,Math.sin(t2)*rad,hei*0.5,(1.0-(t2/D.TWO_PI))*tex.side.w+tex.side.x,1*tex.side.h+tex.side.y,Math.cos(t2),Math.sin(t2),0,r,g,b,a,
                            Math.cos(t2)*rad2,Math.sin(t2)*rad2,-hei*0.5,(1.0-(t2/D.TWO_PI))*tex.side.w+tex.side.x,0*tex.side.h+tex.side.y,Math.cos(t2),Math.sin(t2),0,r,g,b,a)
                        
                        let _vl=__verts.length/D.meshKeyAmount
                        _index.push(_vl,_vl+1,_vl+2,_vl+3,_vl+2,_vl+1)
                    }
                    
                    let _v=__verts.length/D.meshKeyAmount
                    
                    for(let _t=0,inc=D.TWO_PI/detail;_t<=D.TWO_PI;_t+=inc){
                        
                        let t1=_t-inc*0.5,t2=_t+inc*0.5
                        __verts.push(
                            Math.cos(t1)*rad,Math.sin(t1)*rad,hei*0.5,(Math.cos(t1)*0.5+0.5)*tex.bottom.w+tex.bottom.x,-(Math.sin(t1)*0.5+0.5)*tex.bottom.h+tex.bottom.y,0,0,1,r,g,b,a,
                            Math.cos(t2)*rad,Math.sin(t2)*rad,hei*0.5,(Math.cos(t2)*0.5+0.5)*tex.bottom.w+tex.bottom.x,-(Math.sin(t2)*0.5+0.5)*tex.bottom.h+tex.bottom.y,0,0,1,r,g,b,a)
                    }
                    for(let l=__verts.length/D.meshKeyAmount,i=_v;i<l-1;i++){
                        
                        _index.push(_v,i,i+2)
                    }
                    _v=__verts.length/D.meshKeyAmount
                    for(let _t=0,inc=D.TWO_PI/detail;_t<=D.TWO_PI;_t+=inc){
                        
                        let t1=_t-inc*0.5,t2=_t+inc*0.5
                        __verts.push(
                            
                            Math.cos(t1)*rad2,Math.sin(t1)*rad2,-hei*0.5,(Math.cos(t1)*0.5+0.5)*tex.top.w+tex.top.x,(Math.sin(t1)*0.5+0.5)*tex.top.h+tex.top.y,0,0,-1,r,g,b,a,
                            Math.cos(t2)*rad2,Math.sin(t2)*rad2,-hei*0.5,(Math.cos(t2)*0.5+0.5)*tex.top.w+tex.top.x,(Math.sin(t2)*0.5+0.5)*tex.top.h+tex.top.y,0,0,-1,r,g,b,a)
                    }
                    for(let l=__verts.length/D.meshKeyAmount,i=_v;i<l;i++){
                        
                        _index.push(i,i-1,_v)
                    }
                    
                    for(let i in _index){
                        
                        index.push(_index[i]+vl)
                    }
                    
                    for(let i=0;i<__verts.length;i+=D.meshKeyAmount){
                        
                            let rotated=vec3.transformQuat([],[__verts[i],__verts[i+1],__verts[i+2]],_quat)
                            __verts[i]=rotated[0]+x
                            __verts[i+1]=rotated[1]+y
                            __verts[i+2]=rotated[2]+z
                            
                            rotated=vec3.transformQuat(rotated,[__verts[i+5],__verts[i+6],__verts[i+7]],_quat)
                            
                            __verts[i+5]=rotated[0]
                            __verts[i+6]=rotated[1]
                            __verts[i+7]=rotated[2]
                            
                    }
                    
                    for(let i=0,l=__verts.length;i<l;i+=D.meshKeyAmount){
                        
                        for(let k in params.order){
                            
                            verts.push(__verts[i+D.meshKey[params.order[k]]])
                        }
                    }
                }
                
            break
        }
    }
    
    let _index=[]
    
    if(params.wireframe){
        
        for(let i=0,l=index.length;i<l;i+=3){
            
            _index.push(index[i],index[i+1],index[i+1],index[i+2],index[i+2],index[i])
            
        }
        
        return {verts:verts,index:_index,wireframe:true}
    }
    
    return {verts:verts,index:index}
}

D.createOBJMeshData=(params)=>{
    
    params.vl=params.vl||0
    
    let _verts=[],index=[],pos=[],uv=[],normal=[],faces=[],order=params.order
    
    let obj=params.obj.trim().split('\n')
    
    for(let i in obj){
        
        obj[i]=obj[i].trim()
        
        let type=obj[i].split(' ')[0],data=[],s=obj[i].substring(obj[i].indexOf(' ')+1,obj[i].length).split(' ')
        
        for(let j in s){
            
            if(s[j].indexOf('/')<0){
                
                data.push(Number(s[j]))
            }
        }
        
        switch(type){
            
            case 'v':
                
                pos.push(data)
                
            break
            
            case 'vt':
                
                uv.push(data)
                
            break
            
            case 'vn':
                
                normal.push(data)
                
            break
            
            case 'f':
                
                for(let j in s){
                    
                    s[j]=s[j].split('/')
                }
                
                faces.push(s)
                
            break
            
        }
        
    }
    
    for(let i in faces){
        
        let v=[],vt=[],vn=[],vl=(_verts.length/key.length)+params.vl,count=0
        
        for(let j in faces[i]){
            
            let f=faces[i][j]
            
            count++
            _verts.push(...pos[f[0]-1],...uv[f[1]-1],...normal[f[2]-1],...params.color)
        }
        
        for(let i=0;i<count-1;i++){
            
            index.push(vl,i+vl,i+vl+1)
        }
    }
    
    let verts=[]
    
    for(let i=0;i<_verts.length;i+=key.length){
        
        for(let k in order){
            
            verts.push(_verts[i+key[order[k]]])
        }
    }
    
    let _index=[]
    
    if(params.wireframe){
        
        for(let i=0,l=index.length;i<l;i+=3){
            
            _index.push(index[i],index[i+1],index[i+1],index[i+2],index[i+2],index[i])
            
        }
        
        return {verts:verts,index:_index,wireframe:true}
    }
    
    return {verts:verts,index:index}
   
}


return D

})({})
