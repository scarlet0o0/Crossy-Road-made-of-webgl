//////////////////////////////////////////////////////////////////////////////
//
//  Sun-Jeong Kim
//
//////////////////////////////////////////////////////////////////////////////

function trackball(cx, cy) {

    var data = {};

    var rotationMatrix = [1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1];
    // a Quaternion
    var s = 1;
    var v = [0, 0, 0];

    var width = cx;
    var height = cy;
    var lastPos = [0, 0, 0];

    //------------------------------------------------------
    // vector operations
    function normalize(vec) {
        var dist = 1.0 / Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1] + vec[2]*vec[2]);
        vec[0] *= dist;
        vec[1] *= dist;
        vec[2] *= dist;
    }

    function dotProduct(a, b) {
        return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    }

    function crossProduct(a, b, c) {
        c[0] = a[1]*b[2] - a[2]*b[1];
        c[1] = a[2]*b[0] - a[0]*b[2];
        c[2] = a[0]*b[1] - a[1]*b[0];
    }
    //------------------------------------------------------

    function project(xi, yi, vec) {
        // project x, y onto a hemisphere centered within width, height
	    vec[0] = (2.0*xi - width) / width;
	    vec[1] = (height - 2.0*yi) / height;
	    var dist = Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1]);
	    vec[2] = Math.cos(Math.PI * 0.5 * ((dist<1.0)? dist : 1.0));

	    // normalize
	    normalize(vec);
    }

    function start(xi, yi) {
        project(xi, yi, lastPos);
    }

    function end(xi, yi) {
        var currPos = [0, 0, 0];
        project(xi, yi, currPos);

        var diff = [0, 0, 0];
        diff[0] = currPos[0] - lastPos[0];
        diff[1] = currPos[1] - lastPos[1];
        diff[2] = currPos[2] - lastPos[2];

        if( diff[0] || diff[1] || diff[2] ) {
            var angle = Math.PI * 0.5 * Math.sqrt(diff[0]*diff[0] + diff[1]*diff[1] + diff[2]*diff[2]);
            var axis = [0, 0, 0];
            crossProduct(currPos, lastPos, axis);
            normalize(axis);

            // create a quaternion
		    var s2 = Math.sin(angle*0.5);
		    var v2 = [s2*axis[0], s2*axis[1], s2*axis[2]];
		    s2 = Math.cos(angle*0.5);

            // quaternions update -- multiplication of quaternions
		    var s1 = s;
		    var v1 = [v[0], v[1], v[2]];
            var v3 = [0, 0, 0];
		    crossProduct(v1, v2, v3);
		    s = s1*s2 - dotProduct(v1, v2);
		    v[0] = s1*v2[0] + s2*v1[0] + v3[0];
		    v[1] = s1*v2[1] + s2*v1[1] + v3[1];
		    v[2] = s1*v2[2] + s2*v1[2] + v3[2];

            // normalize the quaternion
		    var dist = 1.0 / Math.sqrt(s*s + v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
		    s *= dist;
		    v[0] *= dist;
		    v[1] *= dist;
		    v[2] *= dist;

            // rotation with quaternions	
            // P' = quat * P * quat^-1
            // M = { { 1-2b^2-2c^2, 2ab-2sc,     2ac+2sb }, 
            //		 { 2ab+2sc,     1-2a^2-2c^2, 2bc-2sa },
            //		 { 2ac-2sb,     2bc+2sa,     1-2a^2-2b^2 } };

            // column major
            rotationMatrix[0] = 1.0 - 2.0 * (v[1]*v[1] + v[2]*v[2]);
            rotationMatrix[1] =       2.0 * (v[0]*v[1] + s*v[2]);
            rotationMatrix[2] =       2.0 * (v[2]*v[0] - s*v[1]);
            //rotationMatrix[3] = 0.0;

            rotationMatrix[4] =       2.0 * (v[0]*v[1] - s*v[2]);
            rotationMatrix[5] = 1.0 - 2.0 * (v[2]*v[2] + v[0]*v[0]);
            rotationMatrix[6] =       2.0 * (v[1]*v[2] + s*v[0]);
            //rotationMatrix[7] = 0.0;

            rotationMatrix[8] =        2.0 * (v[2]*v[0] + s*v[1]);
            rotationMatrix[9] =        2.0 * (v[1]*v[2] - s*v[0]);
            rotationMatrix[10] = 1.0 - 2.0 * (v[0]*v[0] + v[1]*v[1]);
            //rotationMatrix[11] = 0.0;

            //rotationMatrix[12] = rotationMatrix[13] = rotationMatrix[14] = 0.0;
            //rotationMatrix[15] = 1.0;

            lastPos[0] = currPos[0];
            lastPos[1] = currPos[1];
            lastPos[2] = currPos[2];
        }
    }

    data.start = start;
    data.end = end;
    data.rotationMatrix = rotationMatrix;

    return data;
}
