window.D=(function(D){

let gl

D.PI=Math.PI
D.HALF_PI=Math.PI*0.5
D.QUATER_PI=Math.PI*0.25
D.THIRD_PI=Math.PI/3
D.TWO_PI=Math.PI*2
D.TO_RAD=Math.PI/180
D.TO_DEG=180/Math.PI
D.INV_255=1/255
D.SQRT_2=Math.sqrt(2)
D.SQRT_HALF=Math.sqrt(0.5)
D.NEG_X=[-1,0,0]
D.X=[1,0,0]
D.NEG_Y=[0,1,0]
D.Y=[0,1,0]
D.NEG_Z=[0,0,-1]
D.Z=[0,0,1]
D.ORIGIN=[0,0,0]
D.random=(min,max)=>Math.random()*(max-min)+min
D.constrain=(x,a,b)=>x<a?a:x>b?b:x
D.map=(value,istart,istop,ostart,ostop)=>ostart+(ostop-ostart)*((value-istart)/(istop-istart))
D.lerp=(a,b,x)=>x*(b-a)+a
D.floatize=(n)=>n-(n|0)>0?n:n+'.'
D.floatify=D.floatize
D.addCommas=(s)=>{for(let i=s.length-3;i>0;i-=3){s=s.substring(0,i)+','+s.substr(i,s.length)}return s}
D.doGrammar=(s)=>{let str=s.slice(),_s='';for(let i in str){if(str[i].toUpperCase()===str[i]){_s=_s+' '+str[i]}else{_s=_s+str[i]}}return _s[0].toUpperCase()+_s.substring(1,_s.length)}
D.doTime=(s)=>(s>=60?((0.0166666667*s)|0)+'m ':'')+(s|0)%60+'s'
D.doPlural=(s)=>{if(s[s.length-1]==='s'){return s}if(s[s.length-1]==='y'){return s.substr(0,s.length-1)+'ies'}if(s[s.length-1]==='x'){return s+'es'}return s+'s'}
D.DEFAULT_POST_PROCESSING_VSH=`#version 300 es\nprecision mediump float;in vec2 vertPos;out vec2 pixUV;void main(){pixUV=vertPos*0.5+0.5;gl_Position=vec4(vertPos,0,1);}`
D.createIdentityMatrix=()=>mat4.identity(new Float32Array(16))
D.IDENTITY_MATRIX=D.createIdentityMatrix()
D.ETMPING_=()=>({top:{x:0,y:0,w:0,h:0,sw:1,sh:1},bottom:{x:0,y:0,w:0,h:0,sw:1,sh:1},left:{x:0,y:0,w:0,h:0,sw:1,sh:1},right:{x:0,y:0,w:0,h:0,sw:1,sh:1},front:{x:0,y:0,w:0,h:0,sw:1,sh:1},back:{x:0,y:0,w:0,h:0,sw:1,sh:1},side:{x:0,y:0,w:0,h:0,sw:1,sh:1}})
D.DTMPING_=()=>({top:{x:0,y:0,w:1,h:1,sw:1,sh:1},bottom:{x:0,y:0,w:1,h:1,sw:1,sh:1},left:{x:0,y:0,w:1,h:1,sw:1,sh:1},right:{x:0,y:0,w:1,h:1,sw:1,sh:1},front:{x:0,y:0,w:1,h:1,sw:1,sh:1},back:{x:0,y:0,w:1,h:1,sw:1,sh:1},side:{x:0,y:0,w:1,h:1,sw:1,sh:1}})
D.ETMPING=D.ETMPING_()
D.DTMPING=D.DTMPING_()
D.getContext=(canv,data={})=>{
    
    gl=canv.getContext('webgl2',data)
    D.gl=gl
    
    if(!gl) alert('WebGL2 is not supported!')
    
    return gl
}

D.getExtension=(e)=>{
    
    if(!gl.getExtension(e)) alert('WebGL2 extension "'+e+'" is not supported!')
}

D.clear=(r=0,g=r,b=r,a=1)=>{
    
    gl.clearColor(r,g,b,a)
    gl.clear(16640)
}

D.viewport=(x,y,w,h)=>{
    
    D.viewportWidth=w
    D.viewportHeight=h
    D.aspect=w/h
    gl.viewport(x,y,w,h)
}

D.createProgram=(vsh_src,fsh_src,debug=false)=>{
    
    let vshText=vsh_src.trim(),fshText=fsh_src.trim()
    
    vshText=vshText.replaceAll('D_INV_WIDTH',D.floatize(1/D.viewportWidth)).replaceAll('D_INV_HEIGHT',D.floatize(1/D.viewportHeight)).replaceAll('D_WIDTH',D.floatize(D.viewportWidth)).replaceAll('D_HEIGHT',D.floatize(D.viewportHeight)).replaceAll('D_ASPECT',D.floatize(D.aspect))
    
    fshText=fshText.replaceAll('D_INV_WIDTH',D.floatize(1/D.viewportWidth)).replaceAll('D_INV_HEIGHT',D.floatize(1/D.viewportHeight)).replaceAll('D_WIDTH',D.floatize(D.viewportWidth)).replaceAll('D_HEIGHT',D.floatize(D.viewportHeight)).replaceAll('D_ASPECT',D.floatize(D.aspect))
    
    vsh=gl.createShader(gl.VERTEX_SHADER)
    fsh=gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(vsh,vshText)
    gl.shaderSource(fsh,fshText)
    gl.compileShader(vsh)
    gl.compileShader(fsh)
    
    if(debug&&!gl.getShaderParameter(vsh,gl.COMPILE_STATUS))
        console.error(vshText+" "+gl.getShaderInfoLog(vsh))
        
    if(debug&&!gl.getShaderParameter(fsh,gl.COMPILE_STATUS))
        console.error(fshText+" "+gl.getShaderInfoLog(fsh))
    
    let p=gl.createProgram()
    gl.attachShader(p,vsh)
    gl.attachShader(p,fsh)
    gl.linkProgram(p)
    
    let locations={},types={},text=vsh_src.trim().split(';')
    
    for(let i in text){
        
        let words=text[i].trim().split(' ')
        
        if(words[0]==='attribute'||words[0]==='in'||words[0]==='uniform'){
            
            locations[words[2]]=gl['get'+({in:'Attrib',attribute:'Attrib',uniform:'Uniform'}[words[0]])+'Location'](p,words[2])
            types[words[2]]=words[1]
            
            if(words[0]==='attribute'||words[0]==='in'){
                
                gl.enableVertexAttribArray(locations[words[2]])
            }
        }
    }
    
    text=fsh_src.trim().split(';')
    
    for(let i in text){
        
        let words=text[i].trim().split(' ')
        
        if(words[0]==='uniform'){
            
            words[2]=words[2].substring(0,words[2].indexOf('[')<0?words[2].length:words[2].indexOf('['))
            
            locations[words[2]]=gl.getUniformLocation(p,words[2])
            types[words[2]]=words[1]
        }
    }
    
    for(let i in types){
        
        types[i]={
            
            float:'1fv',
            vec2:'2fv',
            vec3:'3fv',
            vec4:'4fv',
            int:'1iv',
            ivec2:'2iv',
            ivec3:'3iv',
            ivec4:'4iv',
            sampler2D:'1i',
            isampler2D:'1i',
            samplerCube:'1i',
            mat2:'Matrix2fv',
            mat3:'Matrix3fv',
            mat4:'Matrix4fv'
            
        }[types[i]]
    }
    
    p={gl:p,locations:locations,uniformTypes:types}
    
    D.useProgram(p)
    
    return p 
}

D.setUniform=(name,data)=>{
    
    if(D.currentProgram.locations[name])
        if(D.currentProgram.uniformTypes[name][0]==='M')
            gl['uniform'+D.currentProgram.uniformTypes[name]](D.currentProgram.locations[name],gl.FALSE,data)
        else
            gl['uniform'+D.currentProgram.uniformTypes[name]](D.currentProgram.locations[name],data)
}

D.useProgram=(program)=>{
    
    gl.useProgram(program.gl)
    D.currentProgram=program
}

D.createMesh=(data,pointers,instancedPointers,type='STATIC')=>{
    
    type=type.toUpperCase()+'_DRAW'
    
    let mesh={},pointerStr=''
    
    mesh.verts=data.verts
    mesh.index=data.index
    mesh.type=type
    
    mesh.wireframe=data.wireframe
    mesh.indexAmount=mesh.index.length
    mesh.primitive=data.primitive
    
    mesh.vertBuffer=gl.createBuffer()
    mesh.indexBuffer=gl.createBuffer()
    
    gl.bindBuffer(gl.ARRAY_BUFFER,mesh.vertBuffer)
    gl.bufferData(gl.ARRAY_BUFFER,mesh.verts,gl[type])
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.index,gl[type])
    
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
        mesh.instanceData=new Float32Array(1)
        mesh.instanceSize=instancedPointers[0][2]*0.25
        
        mesh.instanceBuffer=gl.createBuffer()
        
    }
    
    return mesh
}

D.updateMesh=(mesh,data)=>{
    
    if(data){
        
        mesh.verts=Float32Array.from(data.verts)
        mesh.index=Uint32Array.from(data.index)
        mesh.wireframe=data.wireframe??false
        mesh.primitive=data.primitive??'TRIANGLES'
    }
    
    mesh.indexAmount=mesh.index.length
    
    gl.bindBuffer(gl.ARRAY_BUFFER,mesh.vertBuffer)
    gl.bufferData(gl.ARRAY_BUFFER,mesh.verts,gl[mesh.type])
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.index,gl[mesh.type])
}

D.renderMesh=(mesh)=>{
    
    gl.bindBuffer(gl.ARRAY_BUFFER,mesh.vertBuffer)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.indexBuffer)
    mesh.attribFunction(gl,D.currentProgram.locations)
    
    if(mesh.instanceData){
        
        gl.bindBuffer(gl.ARRAY_BUFFER,mesh.instanceBuffer)
        gl.bufferData(gl.ARRAY_BUFFER,mesh.instanceData,gl.DYNAMIC_DRAW)
    
        mesh.instancedAttribFunction(gl,D.currentProgram.locations)
        gl.drawElementsInstanced(gl[mesh.primitive],mesh.indexAmount,gl.UNSIGNED_INT,0,mesh.instanceData.length/mesh.instanceSize)
        
        mesh.clearDivisorsFunction(gl,D.currentProgram.locations)
        
    } else {
        
        gl.drawElements(gl[mesh.primitive],mesh.indexAmount,gl.UNSIGNED_INT,0)
    }
}

D.setInstances=(mesh,data)=>mesh.instanceData=data instanceof Float32Array?data:new Float32Array(data)

D.enable3D=()=>{
    
    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.BACK)
    D.currentCullFace='BACK'
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    D.currentDepthFunc='LEQUAL'
}

D.enable=(t)=>gl.enable(gl[t])
D.disable=(t)=>gl.disable(gl[t])
D.cullFace=(t)=>{D.currentCullFace=t;gl.cullFace(gl[t])}
D.depthFunc=(t)=>{D.currentDepthFunc=t;gl.depthFunc(gl[t])}
D.blendFunc=(t1,t2)=>gl.blendFunc(gl[t1],gl[t2])

D.enableBlend=()=>{
    
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA)
}

D.perspectiveMatrix=(fov=80,aspect=D.aspect,zn=0.1,zf=1000)=>{
    
    let f=Math.tan(1.57079632679-fov*0.008726646),
        rangeInv=1/(zn-zf)
        
    return new Float32Array([
        f/aspect,0,0,0,
        0,f,0,0,
        0,0,(zn+zf)*rangeInv,-1,
        0,0,zn*zf*rangeInv*2,0
    ])
}

D.setViewMatrix=(mat,proj,x,y,z,yaw,pitch,zoomBack=0)=>{
    
    var cp=Math.cos(pitch),sp=Math.sin(pitch),cy=Math.cos(yaw),sy=Math.sin(yaw);
    
    mat[5]=cp;
    mat[6]=sp;
    mat[9]=-sp;
    mat[10]=cp;
    
    mat[0]=cy;
    mat[1]=sp*sy;
    mat[2]=-cp*sy;
    mat[8]=sy;
    mat[9]=-sp*cy;
    mat[10]=cp*cy;
    
    var a00=mat[0],
    a01=mat[1],
    a02=mat[2],
    a11=mat[5],
    a12=mat[6],
    a20=mat[8],
    a21=mat[9],
    a22=mat[10];
    
    x+=mat[2]*zoomBack
    y+=mat[6]*zoomBack
    z+=mat[10]*zoomBack
    
    mat[12]=a00*-x-a20*z;
    mat[13]=a01*-x-a11*y-a21*z;
    mat[14]=a02*-x-a12*y-a22*z;
    mat[15]=1;
    
    let m=mat.slice()
    
    let d=[mat[2],mat[6],mat[10]]
    
    var a00=proj[0],a11=proj[5],a21=proj[9],a22=proj[10],a23=proj[11],a32=proj[14],b0=mat[0],b1=mat[1],b2=mat[2],b3=0;
    
    mat[0]=b0*a00;
    mat[1]=b1*a11+b2*a21;
    mat[2]=b2*a22+b3*a32;
    mat[3]=b2*a23;
    
    b1=mat[5];
    b2=mat[6];
    
    mat[4]=0;
    mat[5]=b1*a11;
    mat[6]=b2*a22;
    mat[7]=b2*a23;
    
    b0=mat[8];
    b1=mat[9];
    b2=mat[10];
    
    mat[8]=b0*a00;
    mat[9]=b1*a11+b2*a21;
    mat[10]=b2*a22;
    mat[11]=b2*a23;
    
    b0=mat[12];
    b1=mat[13];
    b2=mat[14];
    
    mat[12]=b0*a00;
    mat[13]=b1*a11+b2*a21;
    mat[14]=b2*a22+a32;
    mat[15]=b2*a23;
    
    return {camPos:[x,y,z],modelMatrix:m,camDir:d}
}

D.createTexture=(width=D.viewportWidth,height=D.viewportHeight,data=null,filter='LINEAR',wrap='CLAMP_TO_EDGE',internalFormat='RGBA',format='RGBA',type='UNSIGNED_BYTE',mipmap=false)=>{
    
    let t=gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D,t)
    gl.texImage2D(gl.TEXTURE_2D,0,gl[internalFormat],width,height,0,gl[format],gl[type],data)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl[filter])
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl[filter])
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl[wrap])
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl[wrap])
    
    if(mipmap)
        gl.generateMipmap(gl.TEXTURE_2D)
    
    return {texture:t,width:width,height:height}
}

D.bindTexture=(texture)=>gl.bindTexture(gl.TEXTURE_2D,texture===null?null:texture.texture)

D.createFramebuffer=(target=false,depth=false,attachment='COLOR_ATTACHMENT0')=>{
    
    let f=gl.createFramebuffer()
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

D.bindFramebuffer=(framebuffer)=>gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer)

D.drawBuffers=(params)=>{
    
    let arr=[]
    
    for(let i in params){
        
        gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER,gl['COLOR_ATTACHMENT'+i],gl.TEXTURE_2D,params[i].texture,0)
        
        arr.push(gl['COLOR_ATTACHMENT'+i])
    }
    
    gl.drawBuffers(arr)
}

D.activeTextures=(params)=>{
    
    for(let i=0;i<params.length;i+=2){
        
        gl.activeTexture(gl['TEXTURE'+params[i]])
        gl.bindTexture(gl.TEXTURE_2D,params[i+1].texture)
    }
}

D.createMeshData=(params)=>{
    
    let meshKey={x:0,y:1,z:2,u:3,v:4,nx:5,ny:6,nz:7,r:8,g:9,b:10,a:11},meshKeyAmount=0
    
    params.defaultData=params.defaultData||[]
    
    for(let i=0;i<params.defaultData.length;i++){
        
        meshKey['data_'+i]=12+i
    }
    
    for(let i in meshKey){meshKeyAmount++}

    params.vl=params.vl||0
    
    let verts=[],index=[]
    
    for(let j in params.meshes){
        
        let t=params.meshes[j],extraData=t.data||(params.defaultData?params.defaultData:'0'.repeat(params.defaultData.length).split(''))
        
        if(extraData.length!==params.defaultData.length)
            for(let i in params.defaultData)
                if(extraData[i]===undefined)
                    extraData[i]=params.defaultData[i]
        
        switch(t.type){
            
            case 'box':
                
                {
                    let x=t.x??0,
                        y=t.y??0,
                        z=t.z??0,
                        prex=t.prex??0,
                        prey=t.prey??0,
                        prez=t.prez??0,
                        rx=t.rx??0,
                        ry=t.ry??0,
                        rz=t.rz??0,
                        w=t.w??1,
                        h=t.h??1,
                        l=t.l??1,
                        c=[t.r??0,t.g??0,t.b??0,t.a??1],
                        order=params.order,
                        vl=params.vl+(verts.length/order.length)
                        _quat=quat.fromEuler([],rx,ry,rz),
                        _tex=t.textureMapping??D.DTMPING_()
                    
                    _tex.top.w??=w*(_tex.top.sw??1)
                    _tex.top.h??=l*(_tex.top.sh??1)
                    _tex.bottom.w??=w*(_tex.bottom.sw??1)
                    _tex.bottom.h??=l*(_tex.bottom.sh??1)
                    _tex.left.w??=l*(_tex.left.sw??1)
                    _tex.left.h??=h*(_tex.left.sh??1)
                    _tex.right.w??=l*(_tex.right.sw??1)
                    _tex.right.h??=h*(_tex.right.sh??1)
                    _tex.front.w??=w*(_tex.front.sw??1)
                    _tex.front.h??=h*(_tex.front.sh??1)
                    _tex.back.w??=w*(_tex.back.sw??1)
                    _tex.back.h??=h*(_tex.back.sh??1)
                    
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
                        
                        vec3.add(v[i],v[i],[prex,prey,prez])
                        
                        vec3.transformQuat(v[i],v[i],_quat)
                        
                        vec3.add(v[i],v[i],[x,y,z])
                        
                        if(i<6){
                            
                            vec3.transformQuat(n[i],n[i],_quat)
                        }
                    }
                    
                    let _verts=[
                        
                        ...v[0],1*_tex.top.w+_tex.top.x,1*_tex.top.h+_tex.top.y,...n[0],...c,...extraData,
                        ...v[1],1*_tex.top.w+_tex.top.x,0*_tex.top.h+_tex.top.y,...n[0],...c,...extraData,
                        ...v[2],0*_tex.top.w+_tex.top.x,0*_tex.top.h+_tex.top.y,...n[0],...c,...extraData,
                        ...v[3],0*_tex.top.w+_tex.top.x,1*_tex.top.h+_tex.top.y,...n[0],...c,...extraData,
                        
                        ...v[1],0*_tex.back.w+_tex.back.x,0*_tex.back.h+_tex.back.y,...n[1],...c,...extraData,
                        ...v[2],1*_tex.back.w+_tex.back.x,0*_tex.back.h+_tex.back.y,...n[1],...c,...extraData,
                        ...v[5],0*_tex.back.w+_tex.back.x,1*_tex.back.h+_tex.back.y,...n[1],...c,...extraData,
                        ...v[6],1*_tex.back.w+_tex.back.x,1*_tex.back.h+_tex.back.y,...n[1],...c,...extraData,
                        
                        ...v[0],1*_tex.front.w+_tex.front.x,0*_tex.front.h+_tex.front.y,...n[2],...c,...extraData,
                        ...v[3],0*_tex.front.w+_tex.front.x,0*_tex.front.h+_tex.front.y,...n[2],...c,...extraData,
                        ...v[4],1*_tex.front.w+_tex.front.x,1*_tex.front.h+_tex.front.y,...n[2],...c,...extraData,
                        ...v[7],0*_tex.front.w+_tex.front.x,1*_tex.front.h+_tex.front.y,...n[2],...c,...extraData,
                        
                        ...v[2],0*_tex.right.w+_tex.right.x,0*_tex.right.h+_tex.right.y,...n[3],...c,...extraData,
                        ...v[3],1*_tex.right.w+_tex.right.x,0*_tex.right.h+_tex.right.y,...n[3],...c,...extraData,
                        ...v[6],0*_tex.right.w+_tex.right.x,1*_tex.right.h+_tex.right.y,...n[3],...c,...extraData,
                        ...v[7],1*_tex.right.w+_tex.right.x,1*_tex.right.h+_tex.right.y,...n[3],...c,...extraData,
                        
                        ...v[0],0*_tex.left.w+_tex.left.x,0*_tex.left.h+_tex.left.y,...n[4],...c,...extraData,
                        ...v[1],1*_tex.left.w+_tex.left.x,0*_tex.left.h+_tex.left.y,...n[4],...c,...extraData,
                        ...v[4],0*_tex.left.w+_tex.left.x,1*_tex.left.h+_tex.left.y,...n[4],...c,...extraData,
                        ...v[5],1*_tex.left.w+_tex.left.x,1*_tex.left.h+_tex.left.y,...n[4],...c,...extraData,
                        
                        ...v[4],0*_tex.bottom.w+_tex.bottom.x,1*_tex.bottom.h+_tex.bottom.y,...n[5],...c,...extraData,
                        ...v[5],0*_tex.bottom.w+_tex.bottom.x,0*_tex.bottom.h+_tex.bottom.y,...n[5],...c,...extraData,
                        ...v[6],1*_tex.bottom.w+_tex.bottom.x,0*_tex.bottom.h+_tex.bottom.y,...n[5],...c,...extraData,
                        ...v[7],1*_tex.bottom.w+_tex.bottom.x,1*_tex.bottom.h+_tex.bottom.y,...n[5],...c,...extraData
                        
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
                    
                    for(let i=0,l=_verts.length;i<l;i+=meshKeyAmount){
                        
                        for(let k in order){
                            
                            verts.push(_verts[i+meshKey[order[k]]])
                        }
                    }
                    
                }
            
            break
            
            case 'sphere':
                
                {
                    let f=(1+5 ** 0.5)*0.5,
                        T=4 ** D.constrain(t.detail,0,5),
                        tex=t.textureMapping||D.DTMPING_()
                    
                    tex.side.w??=t.radius*2*(tex.side.sw??1)
                    tex.side.h??=t.radius*2*(tex.side.sh??1)
                    
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
                    let midCache=D.constrain(t.detail,0,5)?new Map() : null;
                    
                    function addMidPoint(a,b) {
                        let _key=Math.floor((a+b)*(a+b+1)*0.5)+Math.min(a,b),i=midCache.get(_key);
                        if(i!==undefined){midCache.delete(_key); return i}
                        midCache.set(_key,_v);
                        for(let k=0;k<3;k++)vertices[3*_v+k]=(vertices[3*a+k]+vertices[3*b+k])*0.5
                        i=_v++
                        return i
                    }
                    
                    let trianglesPrev=triangles
                    for(let i=0;i<D.constrain(t.detail,0,5);i++){
                    triangles=new Uint32Array(trianglesPrev.length<<2)
                    for(let k=0;k<trianglesPrev.length; k+=3) {
                        let v1=trianglesPrev[k]
                        let v2=trianglesPrev[k+1]
                        let v3=trianglesPrev[k+2]
                        let a=addMidPoint(v1,v2)
                        let b=addMidPoint(v2,v3)
                        let c=addMidPoint(v3,v1)
                        let t=k<<2
                        triangles[t++]=v1
                        triangles[t++]=a
                        triangles[t++]=c
                        triangles[t++]=v2
                        triangles[t++]=b
                        triangles[t++]=a
                        triangles[t++]=v3
                        triangles[t++]=c
                        triangles[t++]=b
                        triangles[t++]=a
                        triangles[t++]=b
                        triangles[t++]=c
                    }
                    trianglesPrev=triangles
                    }
                    
                    let x=t.x??0,
                        y=t.y??0,
                        z=t.z??0,
                        prex=t.prex??0,
                        prey=t.prey??0,
                        prez=t.prez??0,
                        _quat=quat.fromEuler([],t.rx??0,t.ry??0,t.rz??0),normals=[]
                        
                    for(let i=0;i<vertices.length;i+=3) {
                        
                        let m=1/Math.hypot(vertices[i],vertices[i+1],vertices[i+2])
                        
                        vertices[i]*=m
                        vertices[i+1]*=m
                        vertices[i+2]*=m
                        
                        let tq=vec3.transformQuat([],[vertices[i],vertices[i+1],vertices[i+2]],_quat)
                        
                        normals[i]=tq[0]
                        normals[i+1]=tq[1]
                        normals[i+2]=tq[2]
                        
                        vertices[i]=vertices[i]*t.radius+prex
                        vertices[i+1]=vertices[i+1]*t.radius+prey
                        vertices[i+2]=vertices[i+2]*t.radius+prez
                        
                        tq=vec3.transformQuat([],[vertices[i],vertices[i+1],vertices[i+2]],_quat)
                        
                        vertices[i]=tq[0]+x
                        vertices[i+1]=tq[1]+y
                        vertices[i+2]=tq[2]+z
                    }
                    
                    for(let i in triangles)
                        index.push(triangles[i]+params.vl+(verts.length/params.order.length))
                    
                    __verts=[]
                    
                    for(let i=0,l=vertices.length;i<l;i+=3){
                        
                        __verts.push(vertices[i],vertices[i+1],vertices[i+2],(Math.abs(Math.atan(normals[i]/normals[i+2]))/D.PI)*tex.side.w+tex.side.x,(normals[i+1]*0.5+0.5)*tex.side.h+tex.side.y,normals[i],normals[i+1],normals[i+2],t.r??0,t.g??0,t.b??0,t.a??1,...extraData)
                    }
                    
                    for(let i=0,l=__verts.length;i<l;i+=meshKeyAmount){
                        
                        for(let k in params.order){
                            
                            verts.push(__verts[i+meshKey[params.order[k]]])
                        }
                    }
                }
                
            break
            
            case 'plane':
                
                {
                    let x=t.x??0,
                        y=t.y??0,
                        z=t.z??0,
                        c=[t.r??0,t.g??0,t.b??0,t.a??1],
                        order=params.order,
                        vl=params.vl+(verts.length/order.length),
                        _quat=quat.fromEuler([],t.rx??0,t.ry??0,t.rz??0),
                        s=t.size,
                        tex=t.textureMapping??D.DTMPING_()
                        tex.side.w??=s*(tex.side.sw??1)
                        tex.side.h??=s*(tex.side.sh??1)
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
                        
                        ...v[0],1*tex.side.w+tex.side.x,1*tex.side.h+tex.side.y,...n,...c,...extraData,
                        ...v[1],1*tex.side.w+tex.side.x,0*tex.side.h+tex.side.y,...n,...c,...extraData,
                        ...v[2],0*tex.side.w+tex.side.x,0*tex.side.h+tex.side.y,...n,...c,...extraData,
                        ...v[3],0*tex.side.w+tex.side.x,1*tex.side.h+tex.side.y,...n,...c,...extraData
                    ]
                    
                    index.push(
                        
                        vl,1+vl,2+vl,
                        vl,2+vl,3+vl
                    )
                    
                    for(let i=0,l=_verts.length;i<l;i+=meshKeyAmount){
                        
                        for(let k in order){
                            
                            verts.push(_verts[i+meshKey[order[k]]])
                        }
                    }
                    
                }
            
            break
            
            case 'cylinder':
                
                {
                    let x=t.x??0,
                        y=t.y??0,
                        z=t.z??0,
                        rx=t.rx??0,
                        ry=t.ry??0,
                        rz=t.rz??0,
                        rad=t.radius,
                        rad2=t.radius2??t.radius,
                        detail=t.detail,
                        hei=t.height,
                        r=t.r??0,
                        g=t.g??0,
                        b=t.b??0,
                        a=t.a??1,
                        order=params.order,
                        vl=params.vl+(verts.length/order.length),
                        _quat=quat.fromEuler([],rx,ry,rz),
                        __verts=[],
                        _index=[],
                        tex=t.textureMapping??D.DTMPING_()
                        tex.side.w??=t.radius*D.TWO_PI*(tex.side.sw??1)
                        tex.side.h??=t.height*(tex.side.sh??1)
                        tex.top.w??=t.radius*2*(tex.top.sw??1)
                        tex.top.h??=t.radius*2*(tex.top.sh??1)
                        tex.bottom.w??=t.radius*2*(tex.bottom.sw??1)
                        tex.bottom.h??=t.radius*2*(tex.bottom.sh??1)
                    
                    for(let _t=0,inc=D.TWO_PI/detail;_t<=D.TWO_PI;_t+=inc){
                        
                        let t1=_t-inc*0.5,t2=_t+inc*0.5
                        __verts.push(
                            Math.cos(t1)*rad,Math.sin(t1)*rad,hei*0.5,(1.0-(t1/D.TWO_PI))*tex.side.w+tex.side.x,1*tex.side.h+tex.side.y,Math.cos(t1),Math.sin(t1),0,r,g,b,a,...extraData,
                            Math.cos(t1)*rad2,Math.sin(t1)*rad2,-hei*0.5,(1.0-(t1/D.TWO_PI))*tex.side.w+tex.side.x,0*tex.side.h+tex.side.y,Math.cos(t1),Math.sin(t1),0,r,g,b,a,...extraData,
                            Math.cos(t2)*rad,Math.sin(t2)*rad,hei*0.5,(1.0-(t2/D.TWO_PI))*tex.side.w+tex.side.x,1*tex.side.h+tex.side.y,Math.cos(t2),Math.sin(t2),0,r,g,b,a,...extraData,
                            Math.cos(t2)*rad2,Math.sin(t2)*rad2,-hei*0.5,(1.0-(t2/D.TWO_PI))*tex.side.w+tex.side.x,0*tex.side.h+tex.side.y,Math.cos(t2),Math.sin(t2),0,r,g,b,a,...extraData)
                        
                        let _vl=__verts.length/meshKeyAmount
                        _index.push(_vl,_vl+1,_vl+2,_vl+3,_vl+2,_vl+1)
                    }
                    
                    let _v=__verts.length/meshKeyAmount
                    
                    for(let _t=0,inc=D.TWO_PI/detail;_t<=D.TWO_PI;_t+=inc){
                        
                        let t1=_t-inc*0.5,t2=_t+inc*0.5
                        __verts.push(
                            Math.cos(t1)*rad,Math.sin(t1)*rad,hei*0.5,(Math.cos(t1)*0.5+0.5)*tex.bottom.w+tex.bottom.x,-(Math.sin(t1)*0.5+0.5)*tex.bottom.h+tex.bottom.y,0,0,1,r,g,b,a,...extraData,
                            Math.cos(t2)*rad,Math.sin(t2)*rad,hei*0.5,(Math.cos(t2)*0.5+0.5)*tex.bottom.w+tex.bottom.x,-(Math.sin(t2)*0.5+0.5)*tex.bottom.h+tex.bottom.y,0,0,1,r,g,b,a,...extraData)
                    }
                    for(let l=__verts.length/meshKeyAmount,i=_v;i<l-1;i++){
                        
                        _index.push(_v,i,i+2)
                    }
                    _v=__verts.length/meshKeyAmount
                    for(let _t=0,inc=D.TWO_PI/detail;_t<=D.TWO_PI;_t+=inc){
                        
                        let t1=_t-inc*0.5,t2=_t+inc*0.5
                        __verts.push(
                            
                            Math.cos(t1)*rad2,Math.sin(t1)*rad2,-hei*0.5,(Math.cos(t1)*0.5+0.5)*tex.top.w+tex.top.x,(Math.sin(t1)*0.5+0.5)*tex.top.h+tex.top.y,0,0,-1,r,g,b,a,...extraData,
                            Math.cos(t2)*rad2,Math.sin(t2)*rad2,-hei*0.5,(Math.cos(t2)*0.5+0.5)*tex.top.w+tex.top.x,(Math.sin(t2)*0.5+0.5)*tex.top.h+tex.top.y,0,0,-1,r,g,b,a,...extraData)
                    }
                    for(let l=__verts.length/meshKeyAmount,i=_v;i<l;i++){
                        
                        _index.push(i,i-1,_v)
                    }
                    
                    for(let i in _index){
                        
                        index.push(_index[i]+vl)
                    }
                    
                    for(let i=0;i<__verts.length;i+=meshKeyAmount){
                        
                            let rotated=vec3.transformQuat([],[__verts[i],__verts[i+1],__verts[i+2]],_quat)
                            __verts[i]=rotated[0]+x
                            __verts[i+1]=rotated[1]+y
                            __verts[i+2]=rotated[2]+z
                            
                            rotated=vec3.transformQuat(rotated,[__verts[i+5],__verts[i+6],__verts[i+7]],_quat)
                            
                            __verts[i+5]=rotated[0]
                            __verts[i+6]=rotated[1]
                            __verts[i+7]=rotated[2]
                            
                    }
                    
                    for(let i=0,l=__verts.length;i<l;i+=meshKeyAmount){
                        
                        for(let k in params.order){
                            
                            verts.push(__verts[i+meshKey[params.order[k]]])
                        }
                    }
                }
                
            break
            case 'obj':
                
                {
                    let obj=D.createOBJMeshData({
                        
                        obj:t.obj,
                        order:params.order,
                        color:!t.overrideColor?undefined:[t.r,t.g,t.b,t.a===undefined?1:t.a],
                        defaultData:params.defaultData,
                        data:t.data,
                        ignoreUVs:t.ignoreUVs===undefined?true:t.ignoreUVs,
                        vl:params.vl+(verts.length/params.order.length),
                        transformations:{x:t.x,y:t.y,z:t.z,prex:t.prex,prey:t.prey,prez:t.prez,rx:t.rx,ry:t.ry,rz:t.rz,sx:t.sx,sy:t.sy,sz:t.sz}
                    })
                    
                    verts.push(...obj.verts)
                    index.push(...obj.index)
                }
            
            break
        }
    }
    
    let _index=[]
    
    if(params.wireframe){
        
        for(let i=0,l=index.length;i<l;i+=3){
            
            _index.push(index[i],index[i+1],index[i+1],index[i+2],index[i+2],index[i])
            
        }
        
        return {verts:Float32Array.from(verts),index:Uint32Array.from(_index),primitive:'LINES'}
    }
    
    return {verts:Float32Array.from(verts),index:Uint32Array.from(index),primitive:params.primitive??'TRIANGLES'}
}

D.createOBJMeshData=(params)=>{
    
    let meshKey={x:0,y:1,z:2,u:3,v:4,nx:5,ny:6,nz:7,r:8,g:9,b:10,a:11},meshKeyAmount=0
    
    params.defaultData=params.defaultData??[]
    
    for(let i=0;i<params.defaultData.length;i++){
        
        meshKey['data_'+i]=12+i
    }
    
    for(let i in meshKey){meshKeyAmount++}
    
    params.vl=params.vl??0
    
    let _verts=[],index=[],pos=[],uv=[],normal=[],color=[],mtl={},currentmtl,faces=[],order=params.order,extraData=params.data||'0'.repeat(params.defaultData.length).split('')
    
    if(extraData.length!==params.defaultData.length)
            for(let i in params.defaultData)
                if(extraData[i]===undefined)
                    extraData[i]=params.defaultData[i]
    
    let obj=params.obj.trim().split('\n')
    
    for(let i in obj){
        
        obj[i]=obj[i].trim()
        
        let type=obj[i].split(' ')[0],data=[],s=obj[i].substring(obj[i].indexOf(' ')+1,obj[i].length).split(' ')
        
        for(let j in s){
            
            if(s[j].indexOf('/')<0){
                
                if(type.indexOf('mtl')>-1){
                    
                    data.push(s[j])
                    
                } else {
                    
                    data.push(Number(s[j]))
                }
                
            }
        }
        
        switch(type){
            
            case 'newmtl':
            case 'usemtl':
                
                currentmtl=data.join('_')
                
            break
            
            case 'Kd':
                
                mtl[currentmtl]=data.length===4?data:[...data,1]
                
            break
            
            case 'v':
                
                pos.push(data)
                color.push(mtl[currentmtl])
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
    
    params.transformations=params.transformations??{}
    
    let pre=[params.transformations.prex??0,params.transformations.prey??0,params.transformations.prez??0],_quat=quat.fromEuler([],params.transformations.rx??0,params.transformations.ry??0,params.transformations.rz??0),tr=[params.transformations.x??0,params.transformations.y??0,params.transformations.z??0],sca=[params.transformations.sx??1,params.transformations.sy??1,params.transformations.sz??1]
    
    for(let i in pos){
        
        vec3.add(pos[i],pos[i],pre)
        vec3.mul(pos[i],pos[i],sca)
        vec3.transformQuat(pos[i],pos[i],_quat)
        
        vec3.add(pos[i],pos[i],tr)
    }
    
    for(let i in normal){
        
        vec3.transformQuat(normal[i],normal[i],_quat)
    }
    
    for(let i in faces){
        
        let v=[],vt=[],vn=[],vl=(_verts.length/meshKeyAmount)+params.vl,count=0
        
        for(let j in faces[i]){
            
            let f=faces[i][j]
            
            count++
            _verts.push(...pos[f[0]-1],...(params.ignoreUVs?typeof params.ignoreUVs==='boolean'?[0,0]:params.ignoreUVs:uv[f[1]-1]),...normal[f[2]-1],...(params.color?params.color:color[f[0]-1]),...extraData)
        }
        
        for(let i=0;i<count-1;i++){
            
            index.push(vl,i+vl,i+vl+1)
        }
    }
    
    let verts=[]
    
    for(let i=0;i<_verts.length;i+=meshKeyAmount){
        
        for(let k in order){
            
            verts.push(_verts[i+meshKey[order[k]]])
        }
    }
    
    if(params.wireframe){
        
        let _index=[]
        
        for(let i=0,l=index.length;i<l;i+=3){
            
            _index.push(index[i],index[i+1],index[i+1],index[i+2],index[i+2],index[i])
            
        }
        
        return {verts:Float32Array.from(verts),index:Uint32Array.from(_index),wireframe:true,primitive:'LINES'}
    }
    
    return {verts:Float32Array.from(verts),index:Uint32Array.from(index),primitive:params.primitive??'TRIANGLES'}
}

for(let i in D)D[i[0].toUpperCase()+i.substring(1,i.length)]=D[i]

return D

})({})
