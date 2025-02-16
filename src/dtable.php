<?php
namespace YourVendorName\YourPackageName;
 
class HelloWorld
{
    public function greet(string $name): string
    {
        return "Hello, $name!";
    }
}


// usage:
// require 'vendor/autoload.php';
 
// use YourVendorName\YourPackageName\HelloWorld;
 
// $hello = new HelloWorld();
// echo $hello->greet('John');