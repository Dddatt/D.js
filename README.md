# D.js
A fast, simple, and flexible WebGL &amp; WebGL2 library.<br><br>

Deferred Shading Demo: https://dddatt.github.io/D.js/deferred_shading_demo.html<br>
Instancing Demo: https://dddatt.github.io/D.js/instancing_demo.html<br>
OBJ Demo: https://dddatt.github.io/D.js/obj_demo.html<br>

# Documentation

Notes:

	Add a script with the src 'https://cdn.jsdelivr.net/gh/Dddatt/D.js@v1.0.1/index.js' to a program to use D.js
    
	D.js must be used with glMatrix! Add a script with this src: 'https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js' to your program BEFORE the D.js script




D.getContext
    
	PARAM - canv: An HTML canvas element. Required
    
	PARAM - context: A WebGL context name. Can be 'webgl' or 'webgl2'. Default: 'webgl'
    
	PARAM - data: WebGL context attributes, such as anti-aliasing. Default: uses the default WebGL settings.
    
    
	Returns a WebGL context and alerts if failed. Should only be used once. WebGL2 is HIGHLY RECOMMENDED, but if your browser doesn't support it, then opting for WebGL1 will decrease the amount of features you can use drastically, but functionality is still fine.



D.getExtension
    
	PARAM - e: A WebGL extension name. Required.
    
    
	Gets the WebGL extension of the name provided, and alerts if failed.



D.clear
    
	PARAM - r: The RED color value of the wanted background color in the range of 0 - 1. Required
    
	PARAM - g: The GREEN color value of the wanted background color in the range of 0 - 1. Required
    
	PARAM - b: The BLUE color value of the wanted background color in the range of 0 - 1. Required
    
	PARAM - a: The ALPHA color value of the wanted background color in the range of 0 - 1. Default: 1
    
    
	Clears the WebGL COLOR_BUFFER_BIT and DEPTH_BUFFER_BIT while also setting the background color to the provided params.



D.viewport
    
	PARAM - x: The x position of the viewport. Should often be kept at 0 unless performing a specific task. Required.
    
	PARAM - y: The y position of the viewport. Should often be kept at 0 unless performing a specific task. Required.
    
	PARAM - width: The width of the viewport. Should often be kept at width of the canvas unless performing a specific task. Required.
    
	PARAM - height: The height of the viewport. Should often be kept at the height of the canvas unless performing a specific task. Required.
    
    
	Sets the WebGL viewport to the provided values. Should be called atleast once as setting the viewport is MANDATORY and called as soon as possible after getting the WebGL context.



D.createProgram
    
	PARAM - vsh_src: The GLSL vertex shader in the form of a string. Required
    
	PARAM - fsh_src: The GLSL fragment shader in the form of a string. Required
    
    
	Returns a WebGL program fully created with the provided shaders.



D.setUniform
    
	PARAM - name: The name of the uniform to set. Should be the same as referenced in the shaders. Required.
    
	PARAM - data: The data to set the uniform to. Should be an array of values if uniforming a vector or matrix, else, a number. Required.
    
    
	Sets the uniform of the name stated in the currently used program.



D.useProgram
    
	PARAM - program: A WebGL program returned by D.createProgram you wish to use. Required
    
    
	Tells WebGL to use the provided program.
    


D.enable3D
    
	No params needed.
    
	Enables WebGL BACK face culling and LEQUAL depth testing.



D.enable
    
	PARAM - t: The name of a WebGL feature to enable, for example: 'CULL_FACE'. Required
    
    
	Enables the WebGL feature of the provided name.
    


D.disable
    
	PARAM - t: The name of a WebGL feature to disable, for example: 'CULL_FACE'. Required
    
    
	Disables the WebGL feature of the provided name.
    


D.cullFace
    
	PARAM - t: Sets the WebGL cull face mode to the provided parameter, for example: 'FRONT'. Required
    
    
	Sets the WebGL cull face mode the provided type.
    


D.depthFunc
    
	PARAM - t: Sets the WebGL depth testing mode to the provided parameter, for example: 'LEQUAL'. Required
    
	Sets the WebGL depth testing mode the provided type.
    


D.createIdentityMatrix
    
	No params needed.
    
    
	Returns a Float32Array containing elements of a 4x4 identity matrix.
    


D.prespectiveMatrix
    
	PARAM - fov: The FOV for the projection matrix, in degrees. Required
    
	PARAM - aspect: The aspect for the projection matrix, aka width/height. Required
    
	PARAM - zn: The near distance for the projection matrix. Objects will be rendered if they are further than this limit. Cannot be 0 due to division. Required
    
	PARAM - zf: The far distance for the projection matrix. Objects will be rendered if they are closer than this limit. Should be kept as small as possible to optimize rendering. 1,000 should be fine in most cases. Required
    
    
	Returns a Float32Array containing elements of a 4x4 prespective projection matrix create from provided params.
    


D.setViewMatrix
    
	PARAM - mat: An array of 16 elements. The elements don't matter as they will be changed, but should be a Float32Array as uniforms with typed arrays are more efficent. Required
    
	PARAM - proj: The projection matrix to be transformed. Elements will not be altered during the transformation, but written into 'mat' instead. Required
    
	PARAM - x: The x translation for the outputing view matrix. Required
    
	PARAM - y: The y translation for the outputing view matrix. Required
    
	PARAM - z: The z translation for the outputing view matrix. Required
    
	PARAM - yaw: The yaw for the outputing view matrix, also known as rotation about the y axis. Required
    
	PARAM - pitch: The pitch for the outputing view matrix, also known as rotation about the x axis. Required
    
	PARAM - roll: The roll for the outputing view matrix, also known as rotation about the z axis. Default: 0
    
	PARAM - zoomBack: The amount to translate the position back by. Moves the camera backwards according to the rotation, creating a 3rd person/orbiting camera effect. Default: 0
    
    
	Transforms a projection matrix with given position and rotation. Outputs are written into a Float32Array that should be provided and also returned.
    


D.createMeshData
    
	PARAM - params: An object defining the desired mesh. Required
    
    	PROPERTY of 'params' - meshes: An array with objects each defining a geometry. Each element defines an individual shape. There are currently 3 supported, 'box', 'sphere', and 'plane'. Required.
        	The box has 'x', 'y', 'z', 'w', 'h', 'l', 'r', 'g', 'b', 'rx', 'ry', 'rz' properties.
       	 
        	The sphere has 'x', 'y', 'z', 'radius', 'r', 'g', 'b' properties.
       	 
        	The plane has 'x', 'y', 'z', 'size', 'r', 'g', 'b', 'rx', 'ry', 'rz' properties.
   	 
    	PROPERTY of 'params' - order: An array of elements defining the order of values in a vertex. Elements can include: 'x', 'y', 'z', 'r', 'g', 'b', 'nx', 'ny', 'nz', 'u', 'v'. Default: ['x','y','z','r','g','b','nx','ny','nz']
   	 
    	PROPERTY of 'params' - vl: An numerical offset for the index of a mesh. Should be kept at 0 unless doing specific things. Default: 0
   	 
    	PROPERTY of 'params' - wireframe: A boolean telling D.js whether to display the mesh in wireframe mode or not. Default: false
    
    
	Returns an object with 'verts' and 'index' properties, each a standard array. Both the arrays combined forms a mesh created using the params.
    


D.createOBJMeshData
    
	PARAM - params: An object defining the desired mesh. Required
    
    	PROPERTY of 'params' - obj: A string with the OBJ text for the geometry. Materials are not able to be imported. Currently doesn't support non-standard versions of OBJ formats with vertex colors imbedded in the 'v' line. There MUST be 3 values, v/vt/vn format, for each point in each face. Required.
   	 
    	PROPERTY of 'params' - color: An array of RGB values defining the color of the displayed mesh as there are no materials. Required
   	 
    	PROPERTY of 'params' - order: An array of elements defining the order of values in a vertex. Elements can include: 'x', 'y', 'z', 'r', 'g', 'b', 'nx', 'ny', 'nz', 'u', 'v'. Default: ['x','y','z','r','g','b','nx','ny','nz']
   	 
    	PROPERTY of 'params' - vl: An numerical offset for the index of a mesh. Should be kept at 0 unless doing specific things. Default: 0
   	 
    	PROPERTY of 'params' - wireframe: A boolean telling D.js whether to display the mesh in wireframe mode or not. Default: false
    
    
	Returns an object with 'verts' and 'index' properties, each a standard array. Both the arrays combined forms a mesh created using the params.
    


D.createMesh
    
	PARAM - data: The object returned by D.createMeshData or D.createOBJMeshData. Required
    
	PARAM - pointers: An array with each element being an array with the name and size, stride, and offset values for use in gl.vertexAttribPointers. Required
    
	PARAM - instancedPointers: An array with each element being an array with the name and size, stride, and offset values for use in gl.vertexAttribPointers. These attributes should be used for instancing, with each attribute differing for each instance. If defined, uses instanced rendering for the mesh.  Default: false
    
	PARAM - type: The WebGL buffer draw type to use. Default: 'STATIC'
    
    
	Returns an object with information to be used to render.
    


D.renderMesh
    
	PARAM - mesh: An object returned by D.createMesh. Required
    
    
	Renders the provided mesh.
    


D.clearInstances
    
	PARAM - mesh: An object returned by D.createMesh. Required
    
    
	Clears the data of instances for the mesh. Only to be used if the mesh is rendered by instancing, specified by the existence of the 'instancedPointers' param in D.createMesh.
    


D.addInstance
    
	PARAM - mesh: An object returned by D.createMesh. Required
    
	PARAM - data: An array of data for an instance to be pushed to the data for instances in the mesh. Required
    
    
	Adds data and another instance to the mesh. Only to be used if the mesh is rendered by instancing, specified by the existence of the 'instancedPointers' param in D.createMesh.
    


now we're getting to the big boi webgl stuffs, complicated things with a million parameters each ;-;



D.createTexture
    
	PARAM - width: The width for the texture. Default: the current viewport width
    
	PARAM - height: The height for the texture. Default: the current viewport height
    
	PARAM - data: The data for the texture, in the form of imageData. Must be a Uint8Array, or a ClampedUint8Array(unless using certain extensions) with enough numbers for each RGBA color for each pixel. Default: null, which allocates the WebGL texture, and will show up as an opaque black color
    
	PARAM - filter: The filtering type for the texture. Is set as the same for both TEXTURE_MIN_FILTER and TEXTURE_MAG_FILTER. Should the kept as the default for basic programs. Default: 'LINEAR'
    
	PARAM - wrap: The wrapping type for the texture. Is set as the same for both TEXTURE_WRAP_S and TEXTURE_WRAP_T. Should the kept as the default for basic programs. Default: 'CLAMP_TO_EDGE'
    
	PARAM - format: The color format of the texture. Should the kept as the default for basic programs. Default: 'RGBA'
    
	PARAM - internalFormat: The internal format of the texture. Should the kept as the default for basic programs. Default: 'RGBA'
    
	PARAM - type: The type of the texture. Should the kept as the default for basic programs. Default: 'UNSIGNED_BYTE'
    
	PARAM - mipmap: A boolean to tell WebGL to generate a mipmap or not. The dimensions must be powers of 2 OR the filter and wrap params are the default. Default: false
    
    
	Returns an object with a 'texture', 'width', and 'height' property created with the provided params. 'texture' is the WebGL texture, and 'width' and 'height' are the dimensions of the texture. The texture is automatically bound after calling this.
    


D.bindTexture
    
	PARAM - texture: An object returned by D.createTexture, with 'texture', 'width', and 'height' properties. Required
    
    
	Binds a WebGL texture.
    


D.createFramebuffer
    
	PARAM - target: A texture object returned by D.createTexture to attach to the framebuffer. Default: false
    
	PARAM - depth: A boolean that tells D.js to add a depth renderbuffer to the framebuffer or not. The depth renderbuffer's size is default to the viewport size. Default: false
    
	PARAM - attachment: Defines the attachment type for the framebuffer. Should be kept as the default for basic programs. Default: 'COLOR_ATTACHMENT_0'
    
    
	Returns a WebGL framebuffer with properties created by the provided params.
    


D.bindFramebuffer
    
	PARAM - framebuffer: A WebGL framebuffer to bind. Required
    
    
	Binds a WebGL framebuffer.
    


D.drawBuffers
    
	PARAM - params: An array of texture objects returned by D.createTexture. Required
    
    
	Attaches the provided textures to the currently bound framebuffers with incrementing COLOR_ATTACHMENT values. Then calls gl.drawBuffers to prepare for using multiple render targets.
    


D.activeTextures
    
	PARAM - params: An array of texture objects returned by D.createTexture. Required
    
    
	Activates and binds provided textures with gl.activeTexture of incrementing values. The values in gl.activeTexture corresponds to the array index.
    


the main library is done, these below are just random useful stuff cached for performance



D.HALF_PI: pi/2

D.TWO_PI: pi*2

D.TO_RAD: pi/180

D.TO_DEG: 180/pi

D.READ_ONLY_IDENTITY_MATRIX: A Float32Array with elements of a 4x4 identity matrix. To be used as a cached identity matrix to avoid defining a new one.

D.random(min,max): Returns a random value between the range of min and max.

D.constrain(x,min,max): Returns the value of x limited to between the range of min and max
