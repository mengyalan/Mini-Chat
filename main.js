/* BEGIN JQUERY PLACEHOLDER */
(function($) {
    $.extend({
        placeholder : {
            settings : {
                focusClass : 'placeholderFocus',
                activeClass : 'placeholder',
                overrideSupport : false,
                preventRefreshIssues : true
            },
            debug : false,
            log : function(msg) {
                if (!$.placeholder.debug)
                    return;
                msg = "[Placeholder] " + msg;
                $.placeholder.hasFirebug ? console.log(msg) : $.placeholder.hasConsoleLog ? window.console.log(msg) : alert(msg);
            },
            hasFirebug : "console" in window && "firebug" in window.console,
            hasConsoleLog : "console" in window && "log" in window.console
        }

    });

    // check browser support for placeholder
    $.support.placeholder = 'placeholder' in document.createElement('input');

    // Replace the val function to never return placeholders
    $.fn.plVal = $.fn.val;
    $.fn.val = function(value) {
        $.placeholder.log('in val');
        if (this[0]) {
            $.placeholder.log('have found an element');
            var el = $(this[0]);
            if (value != undefined) {
                $.placeholder.log('in setter');
                var currentValue = el.plVal();
                var returnValue = $(this).plVal(value);
                if (el.hasClass($.placeholder.settings.activeClass) && currentValue == el.attr('placeholder')) {
                    el.removeClass($.placeholder.settings.activeClass);
                }
                return returnValue;
            }

            if (el.hasClass($.placeholder.settings.activeClass) && el.plVal() == el.attr('placeholder')) {
                $.placeholder.log('returning empty because its a placeholder');
                return '';
            } else {
                $.placeholder.log('returning original val');
                return el.plVal();
            }
        }
        $.placeholder.log('returning undefined');
        return undefined;
    };

    // Clear placeholder values upon page reload
    $(window).bind('beforeunload.placeholder', function() {
        var els = $('input.placeholderActive');
        if (els.length > 0)
            els.val('').attr('autocomplete', 'off');
    });

    // plugin code
    $.fn.placeholder = function(opts) {
        opts = $.extend({}, $.placeholder.settings, opts);

        // we don't have to do anything if the browser supports placeholder
        if (!opts.overrideSupport && $.support.placeholder)
            return this;

        return this.each(function() {
            var $el = $(this);

            // skip if we do not have the placeholder attribute
            if (!$el.is('[placeholder]'))
                return;

            // we cannot do password fields, but supported browsers can
            if ($el.is(':password'))
                return;

            // Prevent values from being reapplied on refresh
            if (opts.preventRefreshIssues)
                $el.attr('autocomplete', 'off');

            $el.bind('focus.placeholder', function() {
                var $el = $(this);
                if (this.value == $el.attr('placeholder') && $el.hasClass(opts.activeClass))
                    $el.val('').removeClass(opts.activeClass).addClass(opts.focusClass);
            });
            $el.bind('blur.placeholder', function() {
                var $el = $(this);

                $el.removeClass(opts.focusClass);

                if (this.value == '')
                    $el.val($el.attr('placeholder')).addClass(opts.activeClass);
            });

            $el.triggerHandler('blur');

            // Prevent incorrect form values being posted
            $el.parents('form').submit(function() {
                $el.triggerHandler('focus.placeholder');
            });

        });
    };
})(jQuery);
/* END JQUERY PLACEHOLDER */

/* BEGIN JAPPIX MINI SCRIPTS */
$(document).ready(function() {
    // Yet a launched Mini session?
    if (getDB('jappix-mini', 'dom')) {
        // Remove the login tool
        $('#content div.login').remove();

        // Launch Mini!
        launchMini(true, false, getDB('jappix-mini-login', 'domain'), getDB('jappix-mini-login', 'xid'), getDB('jappix-mini-login', 'pwd'));
    }

    // Security: reset the database
    else
        resetDB();

    // Get tool form reader
    function readGetForm() {
        // Initialize new vars
        var title = '';
        var code = '';
        var end = '';

        // Get the website system type
        var website_sys = $('#website_system').val();

        // Website system
        switch(website_sys) {
            // Dotclear?
            case 'dotclear':
                title = 'Open your template, located in: ./themes/your_theme/tpl/_head.html and put your Jappix Mini code after the existing &lt;script /&gt; elements (no need to search for the &lt;head /&gt; element), then save it and flush your cache.';

                break;

            // Drupal?
            case 'drupal':
                title = 'Open your template, located in: ./themes/your_theme/page.tpl.php and flush your Drupal cache (if any).';

                break;

            // eGroupware?
            case 'egroupware':
                title = 'Open your template, located in: ./phpgwapi/templates/default/footer.tpl and paste it before the &lt;/html&gt; tag.';

                break;

            // FluxBB?
            case 'fluxbb':
                title = 'Open your header file, located in: ./header.php and paste the code after the &lt;title /&gt; element.';
                code += '&lt;?php if(!$pun_user[\'is_guest\']) { ?&gt;<br />';
                end = '&lt;?php } ?&gt;<br />';

                break;

            // phpBB?
            case 'phpbb':
                title = 'Open your template header, located in: ./styles/your_style/template/overall_header.html and refresh the phpBB cache in the administration panel (Styles/Templates/Refresh). Jappix Mini will be only loaded for phpBB logged in users.';
                code += '&lt;!-- IF not S_IS_BOT and S_USER_LOGGED_IN --&gt;<br />';
                end = '&lt;!-- ENDIF --&gt;<br />';

                break;

            // SPIP?
            case 'spip':
                title = 'Open your head template file, located in: ./squelettes-dist/inc-head.html and paste your Jappix Mini code at the end of it (no need to search for the &lt;head /&gt; element).';

                break;

            // Wordpress?
            case 'wordpress':
                title = 'Go to the Wordpress administration panel, then open the theme editor and click on the "header.php" file, in the right toolbar. When you have edited your code, save it. If you are using a caching system such as WP Super Cache, you will need to flush it.';

                break;

            // Other?
            default:
                title = 'Just open the file containing your &lt;head /&gt;, such as head.php or head.html, or anything else.';

                break;
        }

        // Must include jQuery?
        if (!$('#yet_jquery').filter(':checked').size())
            code += '&lt;script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js">&lt;/script&gt;<br /><br />';

        // Continue the code
        code += '&lt;script type="text/javascript"&gt;<br />';

        // Enable script cache
        code += '&nbsp;&nbsp;&nbsp;jQuery.ajaxSetup({cache: true});<br />';
        code += '&nbsp;&nbsp;&nbsp;<br />';

        // Asynchronous script load
        code += '&nbsp;&nbsp;&nbsp;jQuery.getScript("https://static.jappix.com/php/get.php?l=' + ($('#website_language').val() || 'en') + '&amp;t=js&amp;g=mini.xml", function() {<br />';

        // Any defined groupchats?
        var groupchats = $('#join_groupchats').val();

        if (groupchats) {
            // Values array
            var muc_arr = new Array(groupchats);

            // Try to split it
            if (groupchats.indexOf(',') != -1)
                muc_arr = groupchats.split(',');

            // Generate a string array
            var str_arr = '';

            for (i in muc_arr) {
                // Get the current value
                muc_current = muc_arr[i].replace(/^\s+/g, '').replace(/\s+$/g, '');

                // No current value?
                if (!muc_current)
                    continue;

                // Filter the current value
                muc_current = muc_current.replace(/"/g, '\\\"');

                // Any pre-value?
                if (str_arr)
                    str_arr += ', ';

                // Add the current value
                str_arr += '"' + muc_current + '"';
            }

            // Add the array to the code
            code += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MINI_GROUPCHATS = [' + str_arr + '];<br />';
        }

        // Any nickname?
        if (website_sys == 'fluxbb')
            code += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MINI_NICKNAME = "&lt;?php echo str_replace(\'"\', \'\\"\', $pun_user[\'username\']); ?&gt;";<br />';
        else if (website_sys == 'phpbb')
            code += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MINI_NICKNAME = "{S_USERNAME}";<br />';

        // Animated image?
        if ($('#show_animation').filter(':checked').size())
            code += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MINI_ANIMATE = true;<br />';

        // Random nickname?
        if ($('#rand_nick').filter(':checked').size())
            code += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MINI_RANDNICK = true;<br />';

        // Read authentication options
        code += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;launchMini(';

        // Auto login?
        if ($('#auto_login').filter(':checked').size())
            code += 'true';
        else
            code += 'false';

        code += ', ';

        // Auto show?
        if ($('#auto_show').filter(':checked').size())
            code += 'true';
        else
            code += 'false';

        code += ', "anonymous.jappix.com");<br />' + '&nbsp;&nbsp;&nbsp;});<br />' + '&lt;/script&gt;<br />';

        // End code
        code += end;

        // Apply the code!
        $('#website_title').html('» ' + title);
        $('#get_assistant div.code').html(code);
    }

    // Screenshot switcher
    $('#content img.screenshot').everyTime('4s', function() {
        // Read ID
        var id = parseInt($(this).attr('data-id'));
        id++;

        // Too high?
        if (id > 3)
            id = 1;

        // Apply values!
        $(this).attr('src', '/img/screenshots/introduce_' + id + '.png').attr('data-id', id);
    });

    // Placeholder on all the inputs
    $('input').placeholder();

    // Hack for having placeholder on password inputs
    $('input.password_false').focus(function() {
        // Switch the inputs
        $(this).hide();
        $('input.password_real').show().focus();
    })

    $('input.password_real').blur(function() {
        // Switch the inputs (if empty)
        if (!$(this).val()) {
            $(this).hide();
            $('input.password_false').show().placeholder();
        }
    });

    // Submit event on account login
    $('#login_account').submit(function() {
        try {
            // Read the values
            var xid = trim($(this).find('input[name=xid]').val());
            var pwd = trim($(this).find('input[name=pwd]').val());

            // Invalid form?
            if (!xid || !pwd)
                return false;

            // Read the username & domain
            if (xid.match(/([^@]+)@?([^@]+)?/)) {
                var username = RegExp.$1;
                var domain = RegExp.$2;
            }

            // No domain?
            if (!domain)
                domain = 'jappix.com';

            // Remove the login tool
            $('#content div.login').fadeOut('normal', function() {
                $(this).remove();
            });

            // Mini vars
            MINI_GROUPCHATS = ["mini"];

            // Save the values
            setDB('jappix-mini-login', 'domain', domain);
            setDB('jappix-mini-login', 'xid', xid);
            setDB('jappix-mini-login', 'pwd', pwd);

            // Launch mini!
            launchMini(true, true, domain, username, pwd);
        } catch(e) {
        } finally {
            return false;
        }
    });

    // Submit event on anonymous login
    $('#login_anonymous').submit(function() {
        try {
            // Anonymous domain
            var domain = 'anonymous.jappix.com';

            // Read the values
            var nick = trim($(this).find('input[name=nick]').val());
            var room = trim($(this).find('input[name=room]').val());

            // Invalid form?
            if (!nick || !room)
                return false;

            // Remove the login tool
            $('#content div.login').fadeOut('normal', function() {
                $(this).remove();
            });

            // Mini vars
            MINI_NICKNAME = nick;
            MINI_GROUPCHATS = [room];

            // Save the values
            setDB('jappix-mini-login', 'domain', domain);

            // Launch mini!
            launchMini(true, true, domain);
        } catch(e) {
        } finally {
            return false;
        }
    });

    // Submit event on installation form
    $('#get_assistant').submit(function() {
        return false;
    });

    // Navigation into the installation assistant
    $('#get_assistant a.header').click(function() {
        try {
            // Not allowed or already displayed?
            if (!$('#content div.step div.content label.accept input').is(':checked') || $(this).parent().find('div.content').is(':visible'))
                return false;

            // Read again the form
            readGetForm();

            // Hide the visible one
            $('#get_assistant div.content').slideUp();

            // Not done selector
            var selector = '#get_assistant div.step:not(div.step[data-done]):first';

            // Show the requested one
            if ($(this).parent().attr('data-done') == undefined) {
                // Show the first blank step
                $(selector + ' div.content').slideDown();

                // Add the done marker
                $(selector).attr('data-done', true);
            } else
                $(this).parent().find('div.content').slideDown();

            // Add a "thanks" text if setup is finished
            if (!$(selector).size() && !$('#thanks').size()) {
                $('#get_assistant').after('<div id="thanks" class="board success">Thanks for having installed Jappix Mini on your website. Hope it will deliver you goodness!</div>');
            }
        } catch(e) {
        } finally {
            return false;
        }
    });

    // Accept terms of use
    $('#content div.step div.content label.accept input').click(function() {
        if ($(this).is(':checked'))
            $('#step_2 a.header').click();
    });

    // Change event on install assistant inputs
    $('#get_assistant input, #get_assistant select').change(readGetForm);
});
/* END JAPPIX MINI SCRIPTS */