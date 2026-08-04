using System;
using System.Collections.Generic;

namespace BTCPayServer.Plugins.PointOfSale.Models
{
    public enum ProductSalesPeriod
    {
        Today,
        Week,
        Month
    }

    public class ProductSalesViewModel
    {
        public string AppId { get; set; }
        public string StoreId { get; set; }
        public string AppName { get; set; }
        public string Currency { get; set; }
        public ProductSalesPeriod? Period { get; set; }
        public int? TzOffset { get; set; }

        // Summary stats
        public int ItemsSold { get; set; }
        public string RevenueFormatted { get; set; }
        public int Orders { get; set; }
        public string ItemsPerOrder { get; set; }
        public ProductRow BestSeller { get; set; }

        public List<string> Categories { get; set; } = new();
        public List<ProductRow> Products { get; set; } = new();
        public List<OrderRow> OrderList { get; set; } = new();

        public class ProductRow
        {
            public string ItemCode { get; set; }
            public string Title { get; set; }
            public string Category { get; set; }
            public int UnitsSold { get; set; }
            public decimal Revenue { get; set; }
            public string RevenueFormatted { get; set; }
            public decimal SharePercent { get; set; }

            // Inline drill-down
            public List<ChartBucket> Chart { get; set; } = new();
            public List<RecentSale> RecentSales { get; set; } = new();
        }

        public class ChartBucket
        {
            public string Label { get; set; }
            public int Count { get; set; }
        }

        public class RecentSale
        {
            public DateTimeOffset Date { get; set; }
            public string OrderId { get; set; }
            public string InvoiceId { get; set; }
            public string InvoiceUrl { get; set; }
            public int Quantity { get; set; }
            public string SubtotalFormatted { get; set; }
        }

        public class OrderRow
        {
            public DateTimeOffset Date { get; set; }
            public string OrderId { get; set; }
            public string InvoiceId { get; set; }
            public string InvoiceUrl { get; set; }
            public string ItemsSummary { get; set; }
            public bool IsLightning { get; set; }
            public decimal Total { get; set; }
            public string TotalFormatted { get; set; }
        }
    }
}
