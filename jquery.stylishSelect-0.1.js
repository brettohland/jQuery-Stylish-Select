// stylishSelect jQuery plugin v0.1

// Copyright 2007-2010 by brett ohland <hello@brettohland.com>

// This program is free software; you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the Free
// Software Foundation; either version 2 of the License, or (at your option)
// any later version.

// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
// more details.

// You should have received a copy of the GNU General Public License along with
// this program; if not, write to the Free Software Foundation, Inc., 51
// Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.

// stylishSelect turns that drab select box into a delicious looking list of elements
// based on your browser width.

// Suggestions and bug reports go to the project page on Github:
// https://github.com/brettohland/jQuery-Stylish-Select

// Options: Pretty self explanitory.
//		location: Passed verbatim as a class on the city-select box
//		speed		: In miliseconds
//		copy		: Optional copy to appear at the top of the box
//		sizes		: Window sizes that will trigger various columns
//		columns	: The number of columns for each size

(function( $ ){
	
	var settings = {
		'location':     'bottom',
    'hideOnClick':  true,
		'speed':			   500,
		'copy':			  	'Please select an option',
		'sizes':	 {    'small':  450,
								    'medium': 720,
								    'large':  900 },
		'columns': {    'small':  1,
								    'medium': 3,
								    'large':  5 }
	};
	
	var properties = {
      // the timer object is attached to the plugin, might need to be changed in the future.
			containerTimer:		null,
			}
	
	var methods = {
		init : function( options ) {
			
			// Maintain the chainability of the plugin
			return this.each(function() {
				// Extend the settings object with our new ones
					if ( options ) {
						$.extend( settings, options );
					}
				
				// Create the container that is going to display the formatted list
					var $container = $('<div>', { 'class': 'clearfix selectionList ' + settings.location }).hide()
							$container.appendTo($(this).parent())

				// Store the container to be available anywhere
					$(this).data('container', $container)
				
				// Take all of the <option> tags
					$(this).find('option').each(function(index) {
					
            // There's a browser bug in Firefox the stops the preventDefault setting from
            // working with <select> elements. I'm adding some CSS here to hide them until
            // they get their act together.
            // https://bugzilla.mozilla.org/show_bug.cgi?id=291082
              $(this).css('display', 'none')

						// If the value is void, skip it
							if ($(this).attr('disabled') ) return
						
						// Convert each option tag to an li tag
						// Store a reference to the creator as a data object
						
						$('<li/>').appendTo($container)
											.append( $('<a data-value="' + $(this).attr('value') + '">'+ $(this).text() +'</a>').data('source', this))
					});
				
					// Restack the <li> elements into columns
					privateMethods.restack($container)
				
				// Delegte the click event to the containing element
					$container.delegate('li a', 'click.stylishSelect', privateMethods.optionClicked);
					
				// Override the default event on the select group, stopping it from making the pulldown appear
					$(this).bind('mousedown.stylishSelect', privateMethods.checkVisibility)
				
				// Add mouseover/mouseout events to the container div
					$container.bind('mouseleave.stylishSelect', privateMethods.hideWithDelay)
										.bind('mouseenter.stylishSelect', privateMethods.resetTimer)
				
				// Hide the containing div if the user scrolls or resizes the window
					$(window).bind('scroll.stylishSelect', methods.toggleVisibility)
									 .bind('resize.stylishSelect', methods.toggleVisibility)
				
			});
		},
		destroy: function(){
			// Destroys all event bindings
			return this.each(function(){
				$(window).unbind('.stylishSelect');
				// properties.$containingElement.undelegate('li a', 'click');
			})
		}
	};
	
	var privateMethods = {
		
		restack: function($containingElement){
			// Restacks the <li> elements into the number of columns required
			
			// Capture the number of li elements under ths containing Div
				var selectionGroup = $containingElement.find('li'),
						numberOfSubElements = selectionGroup.length
			// Based on the width of the browser, set the number of columns and the class
			// to the container div (sm, med, lrg in the settings object)
			
			var windowWidth = $(window).width();
			if ( windowWidth <= settings.sizes.small ) {
				// Check to see if the size was already set
				if ($containingElement.data().currentSize === "small" ) { return };
				// If not, set it to small
				$containingElement.data().currentSize = "small"
			} else if ( windowWidth > settings.sizes.small && windowWidth < settings.sizes.large ) {
				if ($containingElement.data().currentSize === "medium" ) { return };
				$containingElement.data().currentSize = "medium"
			} else {
				if ($containingElement.data().currentSize === "large" ) { return };
				$containingElement.data().currentSize = "large"
			}
			
			// Reset the list of classes
				$containingElement.removeClass('small medium large')

			// Set the class of the containing div to be reflective of what we just learnt
				$containingElement.addClass($containingElement.data().currentSize)
			
			// Empty out the containing div
				$containingElement.empty()
			
			// Add in the copy (if we were passed any)
				if ( settings.copy ) {
					$containingElement.append('<p>' + settings.copy + '</p>')
				}
			// How many items are there going to be per column?
			// Rounded to the next largest so that there will be an extra group for remainders
				var numberPerColumn = Math.round(numberOfSubElements / settings.columns[$containingElement.data().currentSize]),
					start = 0,
					end		= numberPerColumn,
					i			= 0
				
			// Loop though the list of properties
				for (i; i < settings.columns[$containingElement.data().currentSize]; i++) {
					// Create a group (<ul>), fill it with a slice of the group
					// Append that to the container
						$('<ul/>').append(selectionGroup.slice(start, end))
											.appendTo($containingElement)
					// Increment the start and end points
						start += numberPerColumn
						end		+= numberPerColumn
				}
			
		},
		optionClicked: function( event ){
			// Find the original select box
				var originalSelectBox = $(this).closest('div').siblings('select')
			// Set the value
						originalSelectBox.val($(this).data('value'))
			// Hide
        if ( settings.hideOnClick ) {
          privateMethods.hideContainer( $(this).closest('div') )
        }
		},
		checkVisibility: function( event ){
			// Stop the browser from showing the drop down menu
        console.log(event)
				event.preventDefault()
			// Store the container so we don't have to keep referencing it.
				var container = $(this).data('container');
			// Check to see if we're going to show or hide the element
				if (container.is(':visible')) {
					privateMethods.hideContainer(container)
				} else {
					// restack the list
						privateMethods.restack($(this).data().container)
					// Fade the container in
						privateMethods.showContainer(container)
				}
		},
		resetTimer: function(){
			// Reset the timer if you re-enter the element
			window.clearTimeout(properties.containerTimer)
		},
		hideWithDelay: function( event ){
			// Fade the container out after a delay
			properties.containerTimer = window.setTimeout(function(){
				// Hide the window
					privateMethods.hideContainer ( $(event.currentTarget) )
				// Clear out the timer
					privateMethods.resetTimer()
			}, 500)
		},
		showContainer: function( container ){
			container.fadeIn(properties.speed)
		},
		hideContainer: function( container ){
			container.fadeOut(properties.speed)
		}
		
	}
	
	$.fn.stylishSelect = function( method ) {
		// Method calling logic
		if ( methods[method] ) {
			// If the method exists, use it
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			// If not, assume it's being passed into the init function
			return methods.init.apply( this, arguments );
		} else {
			// If not, tell them off. Make them feel bad.
			$.error( 'Method ' +	method + ' does not exist on jQuery.stylishSelect' );
		}
	};

})( jQuery );

