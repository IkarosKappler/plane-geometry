/**
 * The expression builder is a parametric builder class for creating Javascript expressions.
 *
 * Example:
 *   Template='{P1}*Math.sin({x}) + {P2}*Math.cos({y})'
 *   Parameters={ P1 : 20, 
 *                x  : Math.PI/2.0, 
 *                P2 : 3, 
 *                y  : 0
 *              }
 *   Result='20*Math.sin(Math.PI/2.0) + 3*Math.cos(0)'.
 * Imagine to apply eval(Result) now, which is 23.
 *
 * Usage (with the params from above):
 *   var expressionBuilder = new IKRS.ExpressionBuilder( '{P1}*Math.sin({x}) + {P2}*Math.cos({y})' );
 *   var stringResult      = expressionBuilder.build( Parameters );
 *   // stringReusult should equal '20*Math.sin(Math.PI/2.0) + 3*Math.cos(0)' now.
 *   var numericResult     = expressionBuilder.eval( Parameters );
 *   // numericResult should equal 23.
 *
 * @author  Ikaros Kappler
 * @date    2015-06-08
 * @version 1.0.0
 **/

var IKRS = {};

/**
 * The constructor.
 *
 * @param template:string        A template string containing a variable number of parameters.
 * @param parameterPrefix:string [optional] A string indicating the parameter prefix (default is '{').
 * @param parameterSuffix:string [optional] A string indicating the parameter suffix (default is '}').
 **/
IKRS.ExpressionBuilder = function( template,
				   parameterPrefix,
				   parameterSuffix
				 ) {

    IKRS.Object.call( this );
    
    if( typeof template == "undefined" ) {
	IKRS.error( "Cannot create a new ExpressionBuilder from null-template." );
	throw "Cannot create a new ExpressionBuilder from null-template.";
    }
    if( typeof parameterPrefix == "undefined" ) parameterPrefix = '{';
    if( typeof parameterSuffix == "undefined" ) parameterSuffix = '}';

    //if( parameterSuffix != "{" )
	

    this.template        = template;
    this.parameterSuffix = parameterSuffix;
    this.parameterPrefix = parameterPrefix;

    this.tokenList       = [];
    this.parameterList   = [];
    this.__parseTemplate();
};

IKRS.ExpressionBuilder.prototype = Object.create( Object.prototype );



/**
 * This function checks if the configured term depends on the given parameter token.
 *
 * Pass the token without the leading '{' and '}'.
 *
 * @param param:string The name of the token you want to check.
 **/
IKRS.ExpressionBuilder.prototype.dependsOn = function( param ) {
    for( var i in this.parameterList ) {
	if( this.parameterList[i] == param )
	    return true;
    }
    return false;
};

/**
 * This function will build the expression string from the template and the 
 * actual parameter set.
 *
 * The returned value is a string with the parameter placeholders from the
 * template being replaced from the member values of the passt 'params'
 * object.
 *
 * @param params:object    A javascript object containing the parameter values
 *                         required for the replacement for the placeholders.
 * @param nullValue:string [optional, default="undefined"] Used for replacing
 *                         if a parameter is not present in the passed params.
 **/
IKRS.ExpressionBuilder.prototype.build = function( params,
						   nullValue
						 ) {

    //console.log( "Building term from tokens: " + JSON.stringify(this.tokenList) );
    //if( typeof nullValue == "undefined" )
	//nullValue = "undefined"; 

    //IKRS.debug( "TokenList=" + JSON.stringify(this.tokenList) );

    var buffer = [];
    for( var i = 0; i < this.tokenList.length; i++ ) {

	if( this._isParameterToken(this.tokenList[i]) ) {
	    //console.log( "isParameterToken: " + this.tokenList[i] );

	    var cleanParamName = this._stripTokenPrefixAndSuffix(this.tokenList[i]);
	    var paramValue = null;
	    if( typeof params[cleanParamName] == "undefined" ) {
		if( typeof nullValue == "undefined" || nullValue == null )
		    paramValue = this.tokenList[i];
		else
		    paramValue = nullValue; //"undefined";
	    } else {
		paramValue     = params[cleanParamName];
	    }
	    buffer.push( paramValue );

	} else {
	    // Just a regular token
	    //console.log( "just a regular token: " + this.tokenList[i] );
	    buffer.push( this.tokenList[i] );
	}

    }

    var result = buffer.join("");
    //console.log( "[ExpressionBuilder.build] result=" + result );
    return result;
};

/**
 * This function will build the expression string from the template and the 
 * actual parameter set and evalautes the resulting string.
 *
 * This will just call eval( build(params,nullValue) ).
 *
 * @param params:object    A javascript object containing the parameter values
 *                         required for the replacement for the placeholders.
 * @param nullValue:string [optional, default="undefined"] Used for replacing
 *                         if a parameter is not present in the passed params.
 **/
IKRS.ExpressionBuilder.prototype.eval = function( params, 
						  nullValue 
						) {
    var tmp = this.build(params,nullValue);
    //IKRS.debug( "[IKRS.ExpressionBuilder] template=" + this.template + ", tmp=" + tmp );
    //IKRS.debug( "[IKRS.ExpressionBuilder] eval(tmp)=" + eval(tmp) );
    
    return eval( tmp );
};

IKRS.ExpressionBuilder.prototype.__parseTemplate = function() {

    //IKRS.debug( "__buildInputDependencies: " + this.template );
    //var regex = /\{(\w+)\}/g;
    var regex = new RegExp( "\\{(\\w+)\\}", "g" ); // global match
    /*
    var regex = new RegExp( this.__escapeRegexTokens(this.parameterPrefix) + 
			    "(\\w+)" +
			    this.__escapeRegexTokens(this.parameterSuffix)
			  );
    */
    
    var match        = null;
    var lastMatch    = null;
    var param        = null;
    var lastParam    = null;
    var fullParam    = null;
    var lasFullParam = null;
    var matchCount   = 0;
    while( match = regex.exec(this.template) ) {

	param = match[1];
	fullParam = this.template.substring( match.index, 
					     match.index+match[1].length+2 
					   );
	// IKRS.debug( "lastMatch is null? " + (lastMatch == null) + ", lastMatch=" + JSON.stringify(lastMatch) );
	if( lastMatch != null && lastMatch.index+lastFullParam.length < match.index ) 
	    this.tokenList.push( this.template.substring(lastMatch.index+lastFullParam.length, match.index ) );
	else if( lastMatch == null && match.index > 0 )
	    this.tokenList.push( this.template.substring(0, match.index) );
	    

        this.parameterList.push( param );	
	this.tokenList.push( fullParam );
	//lolCAD.debug( "Found a variable in term: " + param + ", at position " + match.index + ", real extract=" + fullParam );

	lastMatch     = match;
	lastParam     = param;
	lastFullParam = fullParam;
	matchCount++;
    }


    //if( lastMatch != null )
    //	IKRS.debug( "match.index=" + lastMatch.index + ", param.length=" + param.length + ", template.length=" + this.template.length );

    // Add last non-parameter token?
    if( lastMatch != null && lastMatch.index+fullParam.length < this.template.length )
	this.tokenList.push( this.template.substring(lastMatch.index+fullParam.length, this.template.length) ); 
    else if( matchCount == 0 )
	this.tokenList.push( this.template ); // A single numeric expression

    // IKRS.debug( "parameterList=" + JSON.stringify(this.parameterList) + ", tokenList=" + JSON.stringify(this.tokenList) );
    
    var str = "test";
    // console.debug( "type of string variable is: " + (typeof str) );

};

IKRS.ExpressionBuilder.prototype._isParameterToken = function( str ) {

   return ( typeof str == "string" && 
	    str != null &&
	    str.substring(0,this.parameterPrefix.length) == this.parameterPrefix &&
	    str.substring(str.length-this.parameterSuffix.length,str.length) == this.parameterSuffix 
	  );
	    

};

IKRS.ExpressionBuilder.prototype._stripTokenPrefixAndSuffix = function( str ) {

    // IKRS.debug( "str=" + str + ", str.length=" + str.length );
    return str.substring( this.parameterPrefix.length, 
			  str.length - this.parameterSuffix.length 
			);

};


/**
 * This function converts the given regular expression string to 
 * an escaped version.
 **/
IKRS.ExpressionBuilder.prototype.__escapeRegexTokens = function( str ) {
    /*
    var specials = [
        '/', '.', '*', '+', '?', '|',
        '(', ')', '[', ']', '{', '}', '\\'
    ];
    return new RegExp( '(\\' + specials.join('|\\') + ')', 'gim' );
    );
    */
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
