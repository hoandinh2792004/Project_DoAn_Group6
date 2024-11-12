﻿using System.ComponentModel.DataAnnotations;

public class UpdateProductDto
{
    [Required]
    public string Name { get; set; }

    [Required]
    public string Description { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Required]
    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }

    public IFormFile ImageFile { get; set; }

    [Required]
    public string CategoryName { get; set; }
}