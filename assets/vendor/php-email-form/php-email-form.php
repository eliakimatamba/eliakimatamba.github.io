<?php

/**
 * Minimal PHP Email Form class compatible with BootstrapMade's usage
 * Uses PHP mail() by default; can be extended with SMTP if configured.
 */
class PHP_Email_Form
{
    public $ajax = false;
    public $to = '';
    public $from_name = '';
    public $from_email = '';
    public $subject = '';
    public $smtp = null; // optional: ['host'=>..., 'username'=>..., 'password'=>..., 'port'=>...]
    private $messages = array();
    private $error = false;
    private $error_message = '';

    public function add_message($content, $label = '', $length = null)
    {
        if ($label !== '') {
            $this->messages[] = array($label, $content);
        } else {
            $this->messages[] = array('', $content);
        }
        return $this;
    }

    private function build_body()
    {
        $body = '';
        foreach ($this->messages as $m) {
            list($label, $content) = $m;
            if ($label !== '') {
                $body .= $label . ': ' . $content . "\r\n\r\n";
            } else {
                $body .= $content . "\r\n\r\n";
            }
        }
        return rtrim($body);
    }

    private function build_headers()
    {
        $headers = array();
        if ($this->from_email !== '') {
            $from_name = $this->from_name !== '' ? $this->from_name : $this->from_email;
            $headers[] = 'From: ' . $from_name . ' <' . $this->from_email . '>';
            $headers[] = 'Reply-To: ' . $this->from_email;
        }
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        return implode("\r\n", $headers);
    }

    public function send()
    {
        if ($this->to === '') {
            $this->error = true;
            return 'Recipient not set.';
        }
        if ($this->from_email === '' && empty($this->messages)) {
            $this->error = true;
            return 'Incomplete form data.';
        }

        $to = $this->to;
        $subject = $this->subject !== '' ? $this->subject : 'New message from contact form';
        $body = $this->build_body();
        $headers = $this->build_headers();

        // If SMTP configured, we can't easily use PHPMailer here without deps; fallback to mail()
        if ($this->smtp !== null && is_array($this->smtp)) {
            // Simple fallback: try mail() anyway; configure server for SMTP in prod
        }

        if (@mail($to, $subject, $body, $headers)) {
            if ($this->ajax) {
                return 'OK';
            }
            return true;
        } else {
            $this->error = true;
            return 'Message could not be sent. Please try again later.';
        }
    }
}
