<?php

function rewrite_wp_admin_permalinks() {
    add_rewrite_rule(
        '^wp-admin/design/?(.*)?',
        'wp-admin/site-editor.php?path=$1',
        'top'
    );
    flush_rewrite_rules();
}
add_action('init', 'rewrite_wp_admin_permalinks');
